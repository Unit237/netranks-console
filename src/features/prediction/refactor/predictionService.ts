// API service functions for prediction features
import prms from "../../../app/shared/utils/prms";
import type { Segment } from "../components/ui/SegmentDetailModal";

export interface ContentAttributionRequest {
  question_text: string;
  suggest_name: string;
  url_title: string;
  url: string;
}

export interface ContentAttributionResponse {
  success: boolean;
  predicted_rank: number;
  summary: {
    total_segments: number;
    avg_uniqueness_score: number;
    avg_preservation_score: number;
    avg_hybrid_score: number;
  };
  top_helping?: Segment[];
  top_hurting?: Segment[];
  segments?: Segment[];
  error?: string;
}

/**
 * Analyze content attribution for a given URL and question
 */
export const getContentAttribution = async (
  data: ContentAttributionRequest
): Promise<ContentAttributionResponse> => {
  const response = await fetch(`${prms.API_BASE_URL}/analyze-segments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question_text: data.question_text,
      suggest_name: data.suggest_name,
      url_title: data.url_title,
      url: data.url,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = "Failed to fetch content attribution";
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  return {
    success: true,
    ...result,
  };
};
