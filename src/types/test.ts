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
