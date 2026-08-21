import api from "@/lib/axios";
import { GetTestsResponse, Test } from "@/types/test";

export const testService = {
  async getTests(): Promise<Test[]> {
    const response = await api.get<GetTestsResponse>("/tests?page=1&limit=100");

    const result = response.data;
    console.log("result", response.status);

    if (response.status != 200) {
      throw new Error("Unable to fetch tests");
    }

    return result.data;
  },
};
