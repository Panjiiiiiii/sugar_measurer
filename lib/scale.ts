// lib/scale.ts
import plainAxios from "axios";

export const SCALE_FALLBACK_WEIGHT = 5;

export interface ScaleResult {
  weight: number;
  isFallback: boolean;
}

/**
 * Fetch weight from the weighing scale.
 * Never throws - returns fallback weight on any error.
 * 
 * @returns ScaleResult with weight and fallback indicator
 */
export async function fetchScaleWeight(): Promise<ScaleResult> {
  const url = process.env.NEXT_PUBLIC_LOAD_URL;

  if (!url) {
    console.warn("[Scale] NEXT_PUBLIC_LOAD_URL not configured, using fallback weight");
    return { weight: SCALE_FALLBACK_WEIGHT, isFallback: true };
  }

  try {
    const response = await plainAxios.get(url, {
      timeout: 5000,
      withCredentials: false,
    });

    const weight = response.data?.data?.weight;

    if (typeof weight !== "number" || Number.isNaN(weight)) {
      console.warn("[Scale] Invalid weight from scale:", weight);
      return { weight: SCALE_FALLBACK_WEIGHT, isFallback: true };
    }

    console.log("[Scale] Successfully fetched weight:", weight);
    return { weight, isFallback: false };
  } catch (error) {
    if (plainAxios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        console.error("[Scale] Timeout connecting to scale");
      } else if (error.response) {
        console.error("[Scale] Scale returned error:", error.response.status);
      } else if (error.request) {
        console.error("[Scale] No response from scale (network error/CORS)");
      } else {
        console.error("[Scale] Error setting up scale request:", error.message);
      }
    } else {
      console.error("[Scale] Unexpected error fetching scale weight:", error);
    }

    return { weight: SCALE_FALLBACK_WEIGHT, isFallback: true };
  }
}
