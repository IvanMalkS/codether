import { Injectable } from '@nestjs/common';
import fastifyRateLimit from '@fastify/rate-limit';

// Limit rate of requests by ip to 10 per minute

@Injectable()
export class RateLimitMiddleware {
    async use(fastify: any, opts: any, next: Function) {
        fastify.register(fastifyRateLimit, {
            max: 10,
            timeWindow: '1 minute',
        });
        next();
    }
}
