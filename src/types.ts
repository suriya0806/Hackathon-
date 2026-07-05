export type UserRole = "citizen" | "officer" | "engineer" | "admin";

export type Language = "en" | "ta" | "hi";

export type ComplaintStatus =
  | "submitted"
  | "verified"
  | "officer_assigned"
  | "engineer_assigned"
  | "started"
  | "completed"
  | "feedback_received";

export type ComplaintSeverity = "low" | "medium" | "high" | "emergency";

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ComplaintStatus;
  severity: ComplaintSeverity;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reporter: {
    name: string;
    email: string;
    isAnonymous: boolean;
  };
  images: {
    before?: string;
    after?: string;
  };
  video?: string;
  voiceUrl?: string;
  assignedOfficer?: string;
  assignedEngineer?: string;
  aiAnalysis?: {
    issueDetected: string;
    ocrText?: string;
    duplicateDetected: boolean;
    duplicateOfId?: string;
    estimatedCompletionTime: string; // e.g. "48 Hours"
    recommendedDepartment: string;
    summary: string;
    workOrderDetails: string;
  };
  progress: number; // 0 to 100
  history: {
    status: ComplaintStatus;
    timestamp: string;
    note: string;
  }[];
  feedback?: {
    rating: number;
    comment: string;
    timestamp: string;
  };
  eta?: string;
  engineerSignature?: string;
  createdAt: string;
}

export interface LandmarkCase {
  id: string;
  name: string;
  year: number;
  facts: string;
  issues: string;
  judgment: string;
  articlesUsed: string[];
  significance: string;
  aiSummary: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  state: string;
  ministry: string;
  benefits: string;
  eligibility: {
    minAge: number;
    maxAge: number;
    gender: "all" | "male" | "female";
    occupations: string[];
    maxIncome: number;
  };
  requiredDocuments: string[];
  applicationGuidance: string;
  aiExplanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  streak: number;
  badges: string[];
  certificates: {
    id: string;
    title: string;
    date: string;
    score: number;
  }[];
  quizScores: {
    date: string;
    score: number;
    difficulty: "easy" | "medium" | "hard";
  }[];
  learningProgress: {
    lessonId: string;
    completed: boolean;
  }[];
  bookmarks: {
    type: "article" | "case" | "scheme";
    id: string;
  }[];
  createdAt: string;
}
