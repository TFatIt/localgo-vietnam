import OpenAI from 'openai';
import { config } from '../config';
import { Itinerary } from '../models/Itinerary';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

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

const SYSTEM_PROMPT = `You are LocalGo AI, an expert Vietnam travel planner. 
You have deep knowledge of all 63 provinces of Vietnam, including hidden gems, local cuisine, 
transportation options, accommodation, and cultural experiences.

Always respond in JSON format with this exact structure:
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
  async generateTravelPlan(request: TravelPlanRequest) {
    const userPrompt = `Create a ${request.numberOfDays}-day travel plan for ${request.destination}.
Budget: ${request.budget.toLocaleString()} ${request.currency || 'VND'} total
Current location: ${request.currentLocation || 'Not specified'}
Transportation: ${request.transportation.join(', ')}
Travel style: ${request.travelStyle}
Companions: ${request.companions}
Food preferences: ${request.foodPreference.join(', ')}
Special requests: ${request.specialRequests || 'None'}

Please provide detailed daily itineraries with local restaurants, must-see attractions, 
hidden gems, and practical travel tips for Vietnam.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 4000,
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new AppError('AI failed to generate a response', 500);

      const planData = JSON.parse(content);

      // Save to database
      const itinerary = await Itinerary.create({
        userId: request.userId,
        title: planData.title || `${request.numberOfDays} days in ${request.destination}`,
        destination: request.destination,
        numberOfDays: request.numberOfDays,
        budget: request.budget,
        currency: request.currency || 'VND',
        transportation: request.transportation,
        travelStyle: request.travelStyle,
        companions: request.companions,
        foodPreference: request.foodPreference,
        days: planData.days || [],
        totalEstimatedCost: planData.totalEstimatedCost || 0,
        packingChecklist: planData.packingChecklist || [],
        weatherAdvice: planData.weatherAdvice || '',
        aiPrompt: userPrompt,
        isAiGenerated: true,
      });

      return itinerary;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('AI planning error:', error);
      throw new AppError('Failed to generate travel plan. Please try again.', 500);
    }
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    stream = false,
  ): Promise<string | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    const systemMessage = {
      role: 'system' as const,
      content: `You are LocalGo AI, a friendly and knowledgeable Vietnam travel assistant. 
You help travelers discover beautiful places, plan trips, find local food, and experience 
authentic Vietnamese culture. You speak both Vietnamese and English. Always be helpful, 
accurate, and enthusiastic about Vietnam's diverse landscapes and cultures.
Current date: ${new Date().toLocaleDateString('vi-VN')}`,
    };

    if (stream) {
      return openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [systemMessage, ...messages],
        stream: true,
        max_tokens: 1000,
        temperature: 0.8,
      }) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemMessage, ...messages],
      max_tokens: 1000,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I could not process your request.';
  }

  async generateJournalStory(entries: Array<{ date: string; content: string; location?: string; mood?: string }>): Promise<string> {
    const prompt = `Based on these travel journal entries from Vietnam, write a beautiful, engaging travel story in the first person. 
Make it poetic and capture the emotions and experiences:

${entries.map(e => `Day ${e.date} (${e.location || 'Unknown location'}): ${e.content}`).join('\n\n')}

Write a compelling narrative of about 500 words that captures the essence of this journey.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a creative travel writer specializing in Vietnam travel narratives.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1000,
      temperature: 0.9,
    });

    return completion.choices[0]?.message?.content || '';
  }
}

export const aiService = new AIService();
