import api from "@/lib/axios";
import { GetTestsResponse, Test } from "@/types/test";

export interface GetTestsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const testService = {
  async getTests(params: GetTestsParams = {}): Promise<Test[]> {
    const response = await api.get<GetTestsResponse>("/tests", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 100,
        ...(params.search ? { search: params.search } : {}),
      },
    });

    const result = response.data;

    if (response.status !== 200) {
      throw new Error(result.message || "Unable to fetch tests");
    }

    return result.data;
  },
};
