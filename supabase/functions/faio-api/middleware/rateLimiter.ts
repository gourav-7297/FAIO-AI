import { Context, Next } from 'https://deno.land/x/hono@v4.3.11/mod.ts';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const clientLimits = new Map<string, RateLimitInfo>();

export function rateLimiter(options: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    // Identify client by IP address
    const ip = c.req.header('cf-connecting-ip') || 
               c.req.header('x-forwarded-for') || 
               'unknown-ip';

    const now = Date.now();
    let clientLimit = clientLimits.get(ip);

    // If client limit info doesn't exist or has expired, reset it
    if (!clientLimit || now > clientLimit.resetTime) {
      clientLimit = {
        count: 0,
        resetTime: now + options.windowMs,
      };
      clientLimits.set(ip, clientLimit);
    }

    clientLimit.count++;

    // Set standard rate limit headers
    c.header('X-RateLimit-Limit', String(options.max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, options.max - clientLimit.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(clientLimit.resetTime / 1000)));

    if (clientLimit.count > options.max) {
      return c.json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      }, 429);
    }

    await next();
  };
}
