import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService } from '../../../lib/supabase';
import { checkRateLimit } from '../../../lib/rate-limiter';
import { SecurityLogger } from '../../../lib/security-logger';

export async function POST(request: NextRequest) {
    try {
        // IP 기반 Rate Limiting  
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') || // Cloudflare
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const rateLimit = checkRateLimit(clientIP, 5, 15 * 60 * 1000); // 15분에 5번까지

        if (!rateLimit.allowed) {
            SecurityLogger.log({
                type: 'RATE_LIMIT_EXCEEDED',
                ip: clientIP,
                userAgent,
                details: { resetTime: rateLimit.resetTime }
            });

            return NextResponse.json(
                {
                    valid: false,
                    error: 'Too many attempts. Please try again later.',
                    resetTime: rateLimit.resetTime
                },
                { status: 429 }
            );
        }

        const { apiKey } = await request.json();

        // 입력 검증
        if (!apiKey || typeof apiKey !== 'string') {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'missing_or_invalid_type' }
            });

            return NextResponse.json(
                { valid: false, error: 'Invalid API key format' },
                { status: 400 }
            );
        }

        // API 키 형식 검증 (예: marunose- 로 시작하는지)
        if (!apiKey.startsWith('marunose-')) {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'invalid_prefix', keyPrefix: apiKey.substring(0, 10) }
            });

            return NextResponse.json(
                { valid: false, error: 'Invalid API key format' },
                { status: 400 }
            );
        }

        // 서버에서만 API 키 존재 여부 확인
        const allKeys = await apiKeyService.getAllKeys();
        const foundKey = allKeys.find(key => key.key === apiKey.trim() && key.is_active);

        if (foundKey) {
            // ✅ 성공: 키 정보는 노출하지 않고 검증 결과만 반환
            SecurityLogger.log({
                type: 'API_KEY_VALIDATION',
                ip: clientIP,
                userAgent,
                details: { success: true, keyId: foundKey.id }
            });

            return NextResponse.json({
                valid: true,
                message: 'API key is valid'
            });
        } else {
            // ❌ 실패: 구체적인 오류 정보는 제공하지 않음
            SecurityLogger.log({
                type: 'API_KEY_VALIDATION',
                ip: clientIP,
                userAgent,
                details: { success: false, keyPrefix: apiKey.substring(0, 10) }
            });

            return NextResponse.json(
                { valid: false, error: 'Invalid or inactive API key' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('API key validation error:', error);
        return NextResponse.json(
            { valid: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
