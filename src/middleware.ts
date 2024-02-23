import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIp } from './lib/ip'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const ip = getIp();
  nextUrl.searchParams.set('ip', ip || 'unknown')
  return NextResponse.rewrite(nextUrl)
}

export const config = {
  matcher: '/limited',
}