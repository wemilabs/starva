import { connection, NextResponse } from "next/server";

import { getMobileSession } from "@/lib/mobile-auth";
import { getFollowingFeedProducts } from "@/server/follows";

export async function GET() {
  await connection();

  try {
    const session = await getMobileSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await getFollowingFeedProducts();

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === "Unauthorized" ? 401 : 500 },
      );
    }

    const response: {
      products: typeof result.products;
      message?: string;
    } = {
      products: result.products,
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
