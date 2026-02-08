import { connection } from "next/server";

import { getAllStoresWithFollowData } from "@/data/stores";
import { errorResponse, successResponse } from "@/lib/mobile-auth";

export async function GET() {
  await connection();

  try {
    const merchants = await getAllStoresWithFollowData();

    if (!merchants) {
      return successResponse({ merchants: [] });
    }

    return successResponse({ merchants });
  } catch (error) {
    console.error("Failed to fetch merchants:", error);
    return errorResponse("Failed to fetch merchants", 500);
  }
}
