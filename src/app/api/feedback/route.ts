// pages/api/feedback.js

import { feedbackSchema } from "@/lib/vapi";
import { google } from "@ai-sdk/google";
import { PrismaClient } from "@prisma/client";
import { generateObject } from "ai";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { interviewId, userId, transcript } = await req.json();
    console.log("gemini key ", process.env.GOOGLE_GENERATIVE_AI_API_KEY);

    const formattedTranscript = transcript
      .map(
        (sentence: { role: any; content: any }) =>
          `-${sentence.role}: ${sentence.content}`
      )
      .join(" ");

    const {
      object: {
        totalScore,
        categoryScores,
        strengths,
        areasForImprovement,
        finalAssessment,
      },
    } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - Communication Skills: Clarity, articulation, structured responses.
        - Technical Knowledge: Understanding of key concepts for the role.
        - Problem-Solving: Ability to analyze problems and propose solutions.
        - Cultural Fit: Alignment with company values and job role.
        - Confidence and Clarity: Confidence in responses, engagement, and clarity.
      `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories.",
    });

    const feedback = await prisma.feedback.create({
      data: {
        questionId: interviewId,
        userId,
        totalScore,
        strengths,
        areasForImprovement,
        finalAssessment,
        isFeedbackCreated: true,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        feedBackId: feedback.id,
        feedback,
      }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Failed to create feedback:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
      }
    );
  }
}
