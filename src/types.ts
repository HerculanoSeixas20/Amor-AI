export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  relationshipStatus: "dating" | "married" | "single" | "divorced" | "looking_for_love" | "";
  relationshipGoal: string;
  challenges: string;
  communicationStyle: string;
  loveLanguage: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    name: string;
    plan: "Free" | "Premium";
    avatar?: string;
    provider?: string;
    country?: string;
    language?: string;
    currency?: string;
    createdAt?: string;
    lastLogin?: string;
  } | null;
  isOnboarded: boolean;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationAnalysis {
  score: number;
  tone: string;
  interestLevel: string;
  greenFlags: string[];
  redFlags: string[];
  respectScore: number;
  empathyScore: number;
  compatibilityScore: number;
  detailedAnalysis: string;
  nextSteps: string[];
}

export interface MessageGeneratorResult {
  options: {
    text: string;
    explanation: string;
  }[];
}

export interface InterestDetectorResult {
  interestPercentage: number;
  relationshipProbability: number;
  datingProbability: number;
  commitmentProbability: number;
  psychologicalAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SimulatorPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
}

export interface WinBackPhase {
  phaseName: string;
  duration: string;
  objective: string;
  tasks: string[];
}

export interface WinBackResult {
  overallStrategy: string;
  mistakesToAvoid: string[];
  phases: WinBackPhase[];
  psychologicalAdvice: string;
}

export interface RecoveryWeek {
  weekNumber: number;
  theme: string;
  goal: string;
  exercises: string[];
  communicationTip: string;
}

export interface RecoveryResult {
  introduction: string;
  weeks: RecoveryWeek[];
  romanticActivities: string[];
  weeklyReportTemplate: string[];
}

export interface LoveLanguageResult {
  explanationPrimary: string;
  explanationSecondary: string;
  actionSuggestions: string[];
  mistakesToAvoid: string[];
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: "happy" | "neutral" | "sad" | "anxious" | "loving";
  notes: string;
  score: number;
}

export interface DateIdea {
  title: string;
  description: string;
  budgetEstimation: string;
  proTip: string;
}

export interface GiftSuggestion {
  name: string;
  whyItWorks: string;
  approxPrice: string;
  deliveryTip: string;
}

export interface DatingAssistantResult {
  optimizedBio1: string;
  optimizedBio2: string;
  starters: string[];
  photoTips: string[];
  commonMistakes: string[];
}

export interface SinglesLessonResult {
  title: string;
  mindsetShift: string;
  techniques: string[];
  dialogueExamples: string[];
  dailyChallenge: string;
}

export interface RelationshipTestResult {
  score: number;
  resultTitle: string;
  analysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "anniversary" | "birthday" | "datenight" | "special";
  notes?: string;
}

export interface RelationshipGoalItem {
  id: string;
  title: string;
  category: "communication" | "trust" | "romance" | "time" | "conflict";
  targetDate: string;
  progress: number; // 0 to 100
  notes: string;
}
