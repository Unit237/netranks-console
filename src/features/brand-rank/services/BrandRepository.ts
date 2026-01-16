import { ApiError } from "../../../app/lib/api";
import type { BrandOption } from "../@types";

export class BrandRepository {
  async searchBrands(
    query: string,
    signal?: AbortSignal
  ): Promise<BrandOption[]> {
    try {
      const res = await fetch(
        `https://api.brandfetch.io/v2/search/${encodeURIComponent(query)}`,
        { signal }
      );

      if (!res.ok) throw new Error(res.statusText);

      const brands: BrandOption[] = await res.json();
      if (brands.length === 0) {
        return [
          {
            brandId: "_custom",
            icon: "",
            name: query,
            domain: "",
            claimed: false,
            qualityScore: 0,
            verified: false,
            _score: 0,
            description: "",
          },
        ];
      }

      return brands;
    } catch (error) {
      if (error instanceof ApiError && error.isCanceled) {
        throw error;
      }

      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Failed to search brands:", error);
      throw new ApiError(
        error instanceof Error
          ? error.message
          : "Unable to search brands. Please try again."
      );
    }
  }
}

