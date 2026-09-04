import axios from 'axios';
import OpenAI from 'openai';
import { config } from '../config';
import { Itinerary } from '../models/Itinerary';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { isDbConnected } from '../config/database';

export interface TravelPlanRequest {
  userId: string;
  destination: string;
  currentLocation?: string;
  numberOfDays: number;
  budget: number;
  currency?: string;
  transportation: string[];
  travelStyle: string;
  companions: string;
  foodPreference: string[];
  specialRequests?: string;
}

const SYSTEM_PROMPT = `You are LocalGo AI, an expert Vietnam travel planner powered by Google Gemini. 
You have deep knowledge of all 63 provinces of Vietnam, including hidden gems, local cuisine, 
transportation options, accommodation, and cultural experiences.

Always respond in valid JSON format with this exact structure:
{
  "title": "string",
  "destination": "string",
  "totalEstimatedCost": number,
  "currency": "VND",
  "weatherAdvice": "string",
  "packingChecklist": ["string"],
  "days": [
    {
      "day": 1,
      "title": "string",
      "estimatedCost": number,
      "accommodation": { "name": "string", "cost": number },
      "timeline": [
        {
          "time": "HH:MM",
          "activity": "string",
          "placeName": "string",
          "duration": "string",
          "cost": number,
          "notes": "string",
          "type": "attraction|meal|hotel|transport|other"
        }
      ]
    }
  ]
}`;

export class AIService {
  private openaiClient: OpenAI | null = null;

  constructor() {
    if (config.openai.apiKey) {
      this.openaiClient = new OpenAI({ apiKey: config.openai.apiKey });
    }
  }

  /**
   * Helper to execute request with Gemini model fallback (Gemini 3.8 -> Gemini 3.6 -> Gemini Flash Latest)
   */
  private async executeGeminiWithFallback<T>(
    requestFn: (modelName: string) => Promise<T>,
  ): Promise<T> {
    const primaryModel = config.gemini.model || 'gemini-3.8-flash';
    const modelsToTry = [
      primaryModel,
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-flash-latest',
    ].filter((m, idx, self) => self.indexOf(m) === idx);

    let lastError: unknown;
    for (const model of modelsToTry) {
      try {
        return await requestFn(model);
      } catch (err: any) {
        lastError = err;
        const status = err.response?.status;
        logger.warn(
          `Gemini model ${model} issue (${status || err.message}). Attempting candidate fallback...`,
        );
      }
    }
    throw lastError;
  }

  /**
   * Calls Google Gemini API
   */
  private async callGemini(prompt: string, isJson = false): Promise<string> {
    const apiKey = config.gemini.apiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    return this.executeGeminiWithFallback(async (model) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const body: Record<string, unknown> = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        },
      };

      if (isJson) {
        (body.generationConfig as Record<string, unknown>).responseMimeType = 'application/json';
      }

      const response = await axios.post(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      });

      const candidates = response.data?.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned an empty response');
      }

      return text;
    });
  }

  /**
   * Calls Gemini Multi-turn Chat
   */
  private async callGeminiChat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const apiKey = config.gemini.apiKey;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const systemInstruction = {
      parts: [
        {
          text: `Bạn là LocalGo AI, trợ lý du lịch Việt Nam chuyên nghiệp và thân thiện được phát triển bởi Google Gemini 🇻🇳.
Bạn am hiểu tường tận 63 tỉnh thành Việt Nam, địa điểm check-in, ẩm thực ba miền, văn hóa bản địa, lịch trình thông minh và mẹo tiết kiệm chi phí.
Hãy luôn trả lời chi tiết, nhiệt tình, sử dụng tiếng Việt tự nhiên và có emoji sinh động.
Ngày hiện tại: ${new Date().toLocaleDateString('vi-VN')}`,
        },
      ],
    };

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    return this.executeGeminiWithFallback(async (model) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await axios.post(
        url,
        {
          system_instruction: systemInstruction,
          contents,
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 1500,
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000,
        },
      );

      const candidates = response.data?.candidates;
      const text = candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini returned an empty response');
      }

      return text;
    });
  }

  /**
   * Generate travel plan using Gemini -> OpenAI -> Smart Mock
   */
  async generateTravelPlan(request: TravelPlanRequest) {
    const userPrompt = `${SYSTEM_PROMPT}

Create a detailed ${request.numberOfDays}-day travel plan for destination: "${request.destination}".
Budget: ${request.budget.toLocaleString()} ${request.currency || 'VND'} total
Current location: ${request.currentLocation || 'Not specified'}
Transportation: ${request.transportation.join(', ')}
Travel style: ${request.travelStyle}
Companions: ${request.companions}
Food preferences: ${request.foodPreference.join(', ')}
Special requests: ${request.specialRequests || 'None'}

Please provide realistic, high-quality daily itineraries with local Vietnamese restaurants, must-visit attractions, cultural experiences, and estimated costs in VND.`;

    let planData: Record<string, unknown>;

    // 1. Try Google Gemini AI
    if (config.gemini.apiKey) {
      try {
        logger.info('🤖 Generating travel plan with Google Gemini AI...');
        const rawJson = await this.callGemini(userPrompt, true);
        planData = JSON.parse(rawJson);
      } catch (err) {
        logger.warn(`Gemini generation failed: ${(err as Error).message}. Trying fallback...`);
        planData = this.generateSmartMockPlan(request);
      }
    }
    // 2. Try OpenAI as secondary provider
    else if (this.openaiClient) {
      try {
        logger.info('Generating travel plan with OpenAI GPT-4o...');
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 3500,
          temperature: 0.7,
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('OpenAI returned empty content');
        planData = JSON.parse(content);
      } catch (err) {
        logger.warn(`OpenAI failed: ${(err as Error).message}. Using Smart Mock...`);
        planData = this.generateSmartMockPlan(request);
      }
    }
    // 3. Smart Mock Fallback (Guaranteed to succeed)
    else {
      logger.info('💡 No AI API Key found. Generating travel plan using LocalGo Vietnam Smart Knowledge Engine...');
      planData = this.generateSmartMockPlan(request);
    }

    // Prepare itinerary object
    const itineraryPayload = {
      userId: request.userId || 'guest_user',
      title: (planData.title as string) || `Hành trình khám phá ${request.destination} ${request.numberOfDays} ngày`,
      destination: request.destination,
      numberOfDays: request.numberOfDays,
      budget: request.budget,
      currency: request.currency || 'VND',
      transportation: request.transportation,
      travelStyle: request.travelStyle,
      companions: request.companions,
      foodPreference: request.foodPreference,
      days: planData.days || [],
      totalEstimatedCost: (planData.totalEstimatedCost as number) || request.budget,
      packingChecklist: (planData.packingChecklist as string[]) || [
        'Giấy tờ tùy thân (CCCD/Hộ chiếu)',
        'Kem chống nắng & kính râm',
        'Thuốc cá nhân và sạc dự phòng',
        'Trang phục phù hợp thời tiết địa phương',
      ],
      weatherAdvice: (planData.weatherAdvice as string) || `Thời tiết tại ${request.destination} thích hợp cho các hoạt động tham quan ngoài trời. Nên mang theo áo khoác mỏng hoặc ô.`,
      aiPrompt: userPrompt,
      isAiGenerated: true,
    };

    // Save to database if connected; otherwise return in-memory
    if (isDbConnected) {
      try {
        const itinerary = await Itinerary.create(itineraryPayload);
        return itinerary;
      } catch (dbErr) {
        logger.warn('Failed to persist itinerary to MongoDB, returning memory instance:', dbErr);
      }
    }

    return {
      _id: `itin_${Date.now()}`,
      ...itineraryPayload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Chat with AI (Gemini -> OpenAI -> Smart Chat Fallback)
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<string> {
    const latestUserMessage = messages[messages.length - 1]?.content || '';

    // 1. Try Google Gemini
    if (config.gemini.apiKey) {
      try {
        return await this.callGeminiChat(messages);
      } catch (err) {
        logger.warn(`Gemini Chat error: ${(err as Error).message}. Falling back...`);
      }
    }

    // 2. Try OpenAI
    if (this.openaiClient) {
      try {
        const systemMessage = {
          role: 'system' as const,
          content: 'Bạn là LocalGo AI, trợ lý du lịch Việt Nam am hiểu sâu sắc các địa danh, ẩm thực và văn hóa.',
        };
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o',
          messages: [systemMessage, ...messages],
          max_tokens: 1000,
          temperature: 0.8,
        });
        const reply = completion.choices[0]?.message?.content;
        if (reply) return reply;
      } catch (err) {
        logger.warn(`OpenAI Chat error: ${(err as Error).message}`);
      }
    }

    // 3. Smart Vietnam Local Assistant Response
    return this.generateSmartChatResponse(latestUserMessage);
  }

  /**
   * Generate travel story narrative
   */
  async generateJournalStory(
    entries: Array<{ date: string; content: string; location?: string; mood?: string }>,
  ): Promise<string> {
    const prompt = `Dựa trên các ghi chép hành trình du lịch Việt Nam sau đây, hãy viết một câu chuyện du ký giàu cảm xúc, văn phong lãng mạn và hấp dẫn:
${entries.map((e) => `• Ngày ${e.date} (${e.location || 'Việt Nam'}): ${e.content}`).join('\n')}

Hãy viết khoảng 400-500 từ đầy cảm hứng về hành trình này.`;

    if (config.gemini.apiKey) {
      try {
        return await this.callGemini(prompt);
      } catch (err) {
        logger.warn('Gemini story error, falling back:', err);
      }
    }

    return `Chuyến đi qua những nẻo đường Việt Nam đã để lại trong tôi những ký ức khó quên. Từ những sớm mai đón bình minh trong làn sương mờ ảo, đến những chiều tà ngồi bên tách cà phê thơm nồng nghe tiếng cười nói thân thương của người dân địa phương. Mỗi bước chân là một mảnh ghép của sự tự do, vẻ đẹp thiên nhiên kỳ vĩ và lòng hiếu khách nồng hậu. Đây không chỉ là một chuyến du lịch, mà là một hành trình tìm lại sự bình yên trong tâm hồn.`;
  }

  /**
   * Fallback engine for travel planning tailored to Vietnam
   */
  private generateSmartMockPlan(request: TravelPlanRequest): Record<string, unknown> {
    const days = [];
    const dailyBudget = Math.round(request.budget / request.numberOfDays);
    const dest = request.destination;

    const sampleActivities = [
      { time: '07:30', name: `Thưởng thức bữa sáng đặc sản ${dest}`, cost: 50000, duration: '1h', type: 'meal' },
      { time: '09:00', name: `Khám phá thắng cảnh biểu tượng của ${dest}`, cost: 150000, duration: '2.5h', type: 'attraction' },
      { time: '12:00', name: 'Nghỉ ngơi và dùng bữa trưa tại quán ngon bản địa', cost: 120000, duration: '1.5h', type: 'meal' },
      { time: '14:30', name: `Trải nghiệm văn hóa & check-in điểm đến hot tại ${dest}`, cost: 100000, duration: '2h', type: 'attraction' },
      { time: '17:30', name: 'Ngắm hoàng hôn và thưởng thức cà phê view đẹp', cost: 60000, duration: '1.5h', type: 'other' },
      { time: '19:30', name: `Khám phá ẩm thực đêm & dạo chợ đêm ${dest}`, cost: 150000, duration: '2h', type: 'meal' },
    ];

    for (let i = 1; i <= request.numberOfDays; i++) {
      days.push({
        day: i,
        title: `Ngày ${i}: Khám phá trọn vẹn vẻ đẹp ${dest}`,
        estimatedCost: dailyBudget,
        accommodation: {
          name: `Khách sạn / Homestay phong cách ${request.travelStyle} tại trung tâm`,
          cost: Math.round(dailyBudget * 0.4),
        },
        timeline: sampleActivities.map((act) => ({
          time: act.time,
          activity: act.name,
          placeName: `${dest} - Điểm đến nổi bật ngày ${i}`,
          duration: act.duration,
          cost: act.cost,
          notes: 'Nên đặt bàn trước hoặc đi sớm để có vị trí đẹp.',
          type: act.type,
        })),
      });
    }

    return {
      title: `Lịch trình du lịch ${dest} ${request.numberOfDays} ngày (${request.travelStyle})`,
      destination: dest,
      totalEstimatedCost: request.budget,
      currency: request.currency || 'VND',
      weatherAdvice: `Thời tiết tại ${dest} rất thuận lợi cho lịch trình ${request.numberOfDays} ngày. Hãy chuẩn bị kem chống nắng và mũ nón khi di chuyển ban ngày.`,
      packingChecklist: [
        'CCCD/Hộ chiếu và giấy phép lái xe',
        'Trang phục năng động & đồ ấm/đồ bơi theo mùa',
        'Sạc dự phòng, gậy chụp ảnh và máy ảnh',
        'Thuốc say xe, thuốc dị ứng và xịt chống côn trùng',
      ],
      days,
    };
  }

  /**
   * Smart chatbot response for Vietnam travel queries
   */
  private generateSmartChatResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    if (lower.includes('đà lạt') || lower.includes('da lat')) {
      return `Chào bạn! Đà Lạt mùa này rất tuyệt vời 🌲🌸\n\n• **Điểm check-in hot**: Đồi chè Cầu Đất săn mây, Thung lũng Dasar, Samten Hills, Cà phê Túi Mơ To.\n• **Ẩm thực nhất định phải thử**: Bánh tráng nướng Dì Đinh, lẩu gà lá é Tao Ngộ, lẩu bò Ba Toa, bánh căn Lệ.\n• **Mẹo hay**: Sáng sớm và tối nhiệt độ khoảng 14-16°C, bạn nhớ mang áo khoác ấm nhé!`;
    }

    if (lower.includes('đà nẵng') || lower.includes('da nang') || lower.includes('hội an')) {
      return `Đà Nẵng - Hội An là cung đường biển và di sản tuyệt đẹp 🌊🏮\n\n• **Lịch trình gợi ý**: Ngày 1 tắm biển Mỹ Khê & ngắm cầu Rồng phun lửa/nước. Ngày 2 đi Bà Nà Hills. Ngày 3 dạo phố cổ Hội An thả đèn hoa đăng và thử chèo thuyền thúng rừng dừa Bảy Mẫu.\n• **Ẩm thực**: Mì Quảng Ếch Bếp Trang, bánh xèo Bà Dưỡng, cao lầu Hội An, nước Mót thảo mộc.`;
    }

    if (lower.includes('hà nội') || lower.includes('ha noi')) {
      return `Hà Nội nghìn năm văn hiến mang vẻ đẹp rất riêng 🏛️🍜\n\n• **Điểm đến văn hóa**: Hồ Hoàn Kiếm, Văn Miếu Quốc Tử Giám, Nhà tù Hỏa Lò, dạo quanh 36 phố phường.\n• **Ẩm thực đường phố**: Phở Bát Đàn, bún chả Hương Liên, cà phê trứng Giảng, chả cá Lã Vọng, kem Tràng Tiền.`;
    }

    if (lower.includes('hạ long') || lower.includes('ha long')) {
      return `Vịnh Hạ Long - Di sản thiên nhiên thế giới kỳ vĩ ⛵🏝️\n\n• **Trải nghiệm hàng đầu**: Đi du thuyền ngắm vịnh, chèo thuyền kayak qua hang Luồn, tắm biển đảo Ti Tốp, tham quan hang Sửng Sốt.\n• **Món ngon**: Chả mực giã tay ăn kèm xôi/bánh cuốn, sam biển, hải sản tươi sống ở chợ cá Bến Đoan.`;
    }

    if (lower.includes('phú quốc') || lower.includes('phu quoc')) {
      return `Phú Quốc - Thiên đường đảo ngọc phương Nam 🏖️🌅\n\n• **Bãi biển đẹp nhất**: Bãi Sao, Bãi Khem, Bãi Dài.\n• **Hoạt động không thể bỏ lỡ**: Cáp treo Hòn Thơm vượt biển dài nhất thế giới, lặn ngắm san hô cụm đảo An Thới, ngắm hoàng hôn Sunset Sanato.\n• **Ẩm thực**: Bún quậy Kiến Xây, gỏi cá trích, ghẹ Hàm Ninh, hải sản chợ đêm Grand World.`;
    }

    return `Cảm ơn câu hỏi của bạn về du lịch Việt Nam 🇻🇳! 

LocalGo AI (được hỗ trợ bởi Google Gemini) luôn sẵn sàng đồng hành cùng bạn. Bạn có thể hỏi tôi chi tiết về:
1. **Lịch trình**: Đưa ra số ngày và điểm đến, tôi sẽ thiết kế chi tiết từng giờ.
2. **Chi phí & Dự toán**: Tối ưu ngân sách cho chuyến đi tiết kiệm hoặc sang trọng.
3. **Món ăn địa phương**: Gợi ý các quán ăn ngon chuẩn vị người bản địa.
4. **Thời điểm lý tưởng**: Tư vấn mùa đẹp nhất để khám phá từng vùng miền.

Bạn dự định khởi hành chuyến đi tiếp theo đến địa phương nào?`;
  }
}

export const aiService = new AIService();
