import { headers } from "next/headers";

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
