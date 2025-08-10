interface SecurityEvent {
    type: 'API_KEY_VALIDATION' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_FORMAT' | 'BRUTE_FORCE_DETECTED';
    ip: string;
    userAgent?: string;
    timestamp: Date;
    details?: any;
}

export class SecurityLogger {
    private static events: SecurityEvent[] = [];

    static log(event: Omit<SecurityEvent, 'timestamp'>) {
        const logEvent: SecurityEvent = {
            ...event,
            timestamp: new Date()
        };

        this.events.push(logEvent);

        // 콘솔에 기록 (프로덕션에서는 실제 로깅 서비스 사용)
        console.log(`[SECURITY] ${logEvent.type}:`, {
            ip: logEvent.ip,
            userAgent: logEvent.userAgent,
            timestamp: logEvent.timestamp.toISOString(),
            details: logEvent.details
        });

        // 메모리 관리: 최대 1000개의 이벤트만 유지
        if (this.events.length > 1000) {
            this.events = this.events.slice(-500);
        }

        // 의심스러운 활동 감지
        this.detectSuspiciousActivity(event.ip);
    }

    private static detectSuspiciousActivity(ip: string) {
        const recentEvents = this.events.filter(
            event => event.ip === ip &&
                event.timestamp > new Date(Date.now() - 5 * 60 * 1000) // 5분 내
        );

        if (recentEvents.length > 10) {
            this.log({
                type: 'BRUTE_FORCE_DETECTED',
                ip,
                details: { eventCount: recentEvents.length, timeWindow: '5 minutes' }
            });
        }
    }

    static getEvents(ip?: string): SecurityEvent[] {
        if (ip) {
            return this.events.filter(event => event.ip === ip);
        }
        return [...this.events];
    }
}
