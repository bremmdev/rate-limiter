import { headers } from "next/headers";
import { getClient } from "@/lib/client";
import { randomUUID } from "crypto";

export function getIp() {
  let forwardedFor = headers().get("x-forwarded-for");
  let realIp = headers().get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return null;
}

export function createSlidingWindow(timeWindow: number) {
  //check for rate limit by checking requests for this ip in last # seconds (timeWindow)
  const timeWindowStart = new Date(Date.now() - timeWindow * 1000)
    .toISOString()
    .replace("Z", "0000Z");
  return timeWindowStart;
}

export async function checkRateLimit(limit: number) {
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

    //check if the limit is exceeded
    if (count > limit) {
      return {
        limitExceeded: true,
        ip,
        count,
      };
    }

    //no limit exceeded, create a new entity for the ip
    tableClient.createEntity({
      partitionKey: ip,
      rowKey: randomUUID(),
    });

    return {
      limitExceeded: false,
      ip,
      count,
    };
  } catch (e) {
    throw new Error("Internal server error");
  }
}
