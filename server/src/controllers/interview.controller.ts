import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { aiService } from '../services/ai.service';
import Application from '../models/Application';

export const startOrContinueMockInterview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { applicationId, chatHistory } = req.body;
    
    if (!applicationId) {
      res.status(400);
      throw new Error('Application ID is required');
    }

    const application = await Application.findOne({
      _id: applicationId,
      userId: req.user!.id
    }).populate('companyId');

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    const companyName = typeof application.companyId === 'object' ? (application.companyId as any).name : 'the company';
    const jobTitle = application.jobTitle;

    // We will formulate a prompt with the chat history for Gemini.
    // To implement this, we need a method in aiService or we can construct the prompt here and use generateJSON.
    
    // Fallback Mock Response logic if no API key is present
    if (!process.env.GEMINI_API_KEY) {
      setTimeout(() => {
        let responseMessage = '';
        let score = null;
        let feedback = null;

        if (!chatHistory || chatHistory.length === 0) {
          responseMessage = `Welcome! I see you are interviewing for ${jobTitle} at ${companyName}. Can you tell me about a challenging project you've worked on recently?`;
        } else if (chatHistory.length === 1 || chatHistory.length === 2) {
          responseMessage = "That sounds like a great experience. What was the most difficult technical hurdle you faced during that project, and how did you overcome it?";
          score = 7;
          feedback = "Good start, but try to use the STAR method (Situation, Task, Action, Result) to structure your answer better.";
        } else if (chatHistory.length === 3 || chatHistory.length === 4) {
          responseMessage = "Interesting approach. How did you ensure the quality and scalability of your solution?";
          score = 8;
          feedback = "Much better! You clearly explained the actions you took.";
        } else {
          responseMessage = "Thank you for sharing that. Do you have any questions for me about the role or the company?";
          score = 9;
          feedback = "Excellent technical depth in your explanation.";
        }

        res.status(200).json({
          success: true,
          data: {
            message: responseMessage,
            score: score,
            feedback: feedback
          }
        });
      }, 1500);
      return;
    }

    // Call the actual AI service
    const aiResponse = await aiService.generateMockInterviewResponse({
      jobTitle,
      companyName,
      chatHistory
    });

    res.status(200).json({
      success: true,
      data: aiResponse
    });
  } catch (error) {
    next(error);
  }
};
