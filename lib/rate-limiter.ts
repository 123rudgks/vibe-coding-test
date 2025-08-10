// Rate limiting을 위한 간단한 메모리 기반 구현
// 프로덕션에서는 Redis 등을 사용하는 것이 좋습니다

interface RateLimit {
    count: number;
    lastReset: number;
}

const rateLimitMap = new Map<string, RateLimit>();

export function checkRateLimit(
    identifier: string,
    maxRequests: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15분
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = rateLimitMap.get(identifier);

    if (!record || record.lastReset < windowStart) {
        record = { count: 0, lastReset: now };
        rateLimitMap.set(identifier, record);
    }

    if (record.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: record.lastReset + windowMs
        };
    }

    record.count++;

    return {
        allowed: true,
        remaining: maxRequests - record.count,
        resetTime: record.lastReset + windowMs
    };
}

// 주기적으로 오래된 기록 정리
setInterval(() => {
    const now = Date.now();
    const cutoff = now - (15 * 60 * 1000); // 15분 전

    for (const [key, record] of rateLimitMap.entries()) {
        if (record.lastReset < cutoff) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000); // 5분마다 정리
