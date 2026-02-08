import { connection, type NextRequest, NextResponse } from "next/server";

import { getMobileSession } from "@/lib/mobile-auth";
import { getFollowingFeedProducts } from "@/server/follows";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const result = await getFollowingFeedProducts({ limit, offset });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 },
      );
    }

    const response: {
      products: typeof result.products;
      total: number;
      hasMore: boolean;
      message?: string;
    } = {
      products: result.products,
      total: result.total,
      hasMore: result.hasMore,
    };

    if (result.message) {
      response.message = result.message;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch following feed:", error);
    return NextResponse.json(
      { error: "Failed to fetch following feed" },
      { status: 500 },
    );
  }
}
