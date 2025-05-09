interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}
interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}
interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}
interface Job {
  id: number;
  position: string;
  company: string;
  company_logo?: string;
  logo?: string;
  location: string;
  tags: string[];
  apply_url?: string;
  description?: string;
  url: string;
  date: Date;
  id: string;
  salary_min?: Int;
  salary_max?: Int;
}

interface SignUpParams {
  id?: string;
  name: string;
  email: string;
  password: string;
}

interface SignInParams {
  id?: string;
  email: string;
  password: string;
}

interface AgentProps {
  username?: string;
  interviewId: string | null;
  id?: string;
  type: string;
  questions?: JSON[];
}

interface SavedMessaged {
  role: "user" | "system" | "assistant";
  content: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}
