import { apiClient } from "../../../../app/lib/api";
import { createSurvey, getSurveyById } from "../projectService";

// Mock dependencies
jest.mock("../../../../app/lib/api", () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    isCanceled = false;
    constructor(message: string) {
      super(message);
      this.name = "ApiError";
    }
  },
}));

describe("projectService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSurvey", () => {
    it("should create a survey successfully", async () => {
      const mockSurveyId = 123;
      (apiClient.post as jest.Mock).mockResolvedValue(mockSurveyId);

      const result = await createSurvey(1, 24, "Test Survey", [
        "Question 1",
        "Question 2",
      ]);

      expect(apiClient.post).toHaveBeenCalledWith("api/CreateSurvey", {
        ProjectId: 1,
        SchedulePeriodHours: 24,
        Name: "Test Survey",
        Questions: ["Question 1", "Question 2"],
      });
      expect(result).toBe(mockSurveyId);
    });

    it("should handle errors when creating survey", async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(
        createSurvey(1, 24, "Test Survey", ["Question 1"])
      ).rejects.toThrow();
    });
  });

  describe("getSurveyById", () => {
    it("should fetch survey by id successfully", async () => {
      const mockSurvey = {
        Id: 1,
        Name: "Test Survey",
        Questions: ["Question 1"],
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockSurvey);

      const result = await getSurveyById(1);

      expect(apiClient.get).toHaveBeenCalledWith("api/GetSurvey/1");
      expect(result).toEqual(mockSurvey);
    });

    it("should handle errors when fetching survey", async () => {
      (apiClient.get as jest.Mock).mockRejectedValue(
        new Error("Survey not found")
      );

      await expect(getSurveyById(999)).rejects.toThrow();
    });
  });
});
