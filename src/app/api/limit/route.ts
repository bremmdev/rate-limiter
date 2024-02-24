export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/limit";

export async function GET() {
  try {
    const { limitExceeded, ip } = await checkRateLimit(5);
    if (limitExceeded) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }
    return NextResponse.json({ clientIp: ip }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
