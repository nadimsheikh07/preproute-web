export type TestStatus = "draft" | "published";

export interface Test {
  id: string;
  name: string;
  subject: string;
  topics: string[];
  status: TestStatus;
  created_at: string;
}

export interface GetTestsResponse {
  success: boolean;
  data: Test[];
}

export type QuestionType = "mcq";
export type Difficulty = "easy" | "medium" | "hard";

export type TestResponse = {
  id: string;
  name: string;
  type: string;
  subject: string;
  topics: string[];
  sub_topics: string[];
  questions: string[];
  correct_marks: number;
  unattempt_marks: number;
  wrong_marks: number;
  difficulty: Difficulty;
  total_marks: number;
  total_time: number;
  total_questions: number;
  slot: unknown;
  hidden_from_moderator: unknown;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  paragraph_question: unknown;
  status: string;
  scheduled_date: string | null;
  expiry_date: string | null;
  original_files: unknown[];
};
