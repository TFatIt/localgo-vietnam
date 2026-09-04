import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { aiService } from '../services/ai.service';
import { asyncHandler, sendSuccess } from '../utils/helpers';
import { ValidationError } from '../utils/errors';

export const generateTravelPlan = asyncHandler(async (req: AuthRequest, res: Response) => {
  const {
    destination,
    currentLocation,
    numberOfDays,
    budget,
    currency,
    transportation,
    travelStyle,
    companions,
    foodPreference,
    specialRequests,
  } = req.body as {
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
  };

  if (!destination || !numberOfDays || !budget) {
    throw new ValidationError('destination, numberOfDays, and budget are required');
  }

  const itinerary = await aiService.generateTravelPlan({
    userId: req.user!._id,
    destination,
    currentLocation,
    numberOfDays,
    budget,
    currency,
    transportation: transportation || [],
    travelStyle: travelStyle || 'moderate',
    companions: companions || 'solo',
    foodPreference: foodPreference || [],
    specialRequests,
  });

  sendSuccess(res, { itinerary }, 'Travel plan generated', 201);
});

export const chatWithAI = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { messages } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!messages || messages.length === 0) {
    throw new ValidationError('messages array is required');
  }

  const reply = await aiService.chat(messages) as string;
  sendSuccess(res, { reply });
});

export const chatStream = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { messages } = req.body as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  if (!messages || messages.length === 0) {
    throw new ValidationError('messages array is required');
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const stream = await aiService.chat(messages, true) as AsyncIterable<{
    choices: Array<{ delta: { content?: string } }>;
  }>;

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  res.write('data: [DONE]\n\n');
  res.end();
});

export const generateJournalStory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { entries } = req.body as {
    entries: Array<{ date: string; content: string; location?: string; mood?: string }>;
  };

  if (!entries || entries.length === 0) {
    throw new ValidationError('Journal entries are required');
  }

  const story = await aiService.generateJournalStory(entries);
  sendSuccess(res, { story });
});
