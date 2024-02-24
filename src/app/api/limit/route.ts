export const dynamic = "force-dynamic";

import { getClient } from "@/lib/client";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getIp, createSlidingWindow } from "@/lib/limit";

export async function GET() {
  const ip =
    process.env.ENVIRONMENT === "dev" ? "0.0.0.0" : getIp() || "unknown";
  const tableClient = getClient();

  try {
    const timeWindowStart = createSlidingWindow(60);
    const entities = tableClient.listEntities({
      queryOptions: {
        //note: cast to datetime is required for the query to work
        filter: `PartitionKey eq '${ip}' and Timestamp ge datetime'${timeWindowStart}'`,
      },
    });
    //count the current request and the previous ones in the time window
    let count = 1;
    for await (const _ of entities) {
      count++;
    }

    if (count > 5) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    //no limit exceeded, create a new entity for the ip
    tableClient.createEntity({
      partitionKey: ip,
      rowKey: randomUUID(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ clientIp: ip }, { status: 200 });
}
