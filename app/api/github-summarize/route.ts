import { NextRequest, NextResponse } from 'next/server';
import { apiKeyService } from '../../../lib/supabase';
import { checkRateLimit } from '../../../lib/rate-limiter';
import { SecurityLogger } from '../../../lib/security-logger';
import { ChainFactory, GitHubUserChain } from '../../../lib/chain';

// GitHub API를 통한 README 가져오기 및 요약
async function generateGitHubSummary(githubUrl: string, options?: { includeFullReadme?: boolean }) {
    try {
        // GitHub URL에서 owner와 repo 추출
        const urlMatch = githubUrl.match(/https:\/\/github\.com\/([^\/]+)(?:\/([^\/]+))?/);
        if (!urlMatch) {
            throw new Error('Invalid GitHub URL format');
        }

        const [, owner, repo] = urlMatch;

        // 사용자 프로필 URL인 경우 (repo가 없는 경우)
        if (!repo) {
            return await generateUserProfileSummary(owner);
        }

        // 저장소 URL인 경우
        return await generateRepositorySummary(owner, repo, options);

    } catch (error) {
        console.error('GitHub summary generation error:', error);
        throw error;
    }
}

// 사용자 프로필 요약 (체인 사용)
async function generateUserProfileSummary(username: string) {
    return await GitHubUserChain.analyzeUser(username);
}

// 저장소 요약
async function generateRepositorySummary(owner: string, repo: string, options?: { includeFullReadme?: boolean }) {
    try {
        // 저장소 기본 정보 가져오기
        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'GitHub-Summarizer/1.0'
            }
        });

        if (!repoResponse.ok) {
            throw new Error(`Failed to fetch repository data: ${repoResponse.status}`);
        }

        const repoData = await repoResponse.json();

        // 저장소 언어 정보 가져오기 (먼저 처리)
        let languages = {};
        try {
            const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Summarizer/1.0'
                }
            });
            if (languagesResponse.ok) {
                languages = await languagesResponse.json();
            }
        } catch (langError) {
            console.warn('Languages fetch failed:', langError);
        }

        // README 파일 가져오기
        let readmeContent = '';
        let readmeSummary = '';
        let coolFacts: string[] = [];

        try {
            const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Summarizer/1.0'
                }
            });

            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                // Base64 디코딩
                readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');

                // README 요약 생성 (체인 사용)
                const summaryResult = await ChainFactory.summarizeReadme(readmeContent);
                readmeSummary = summaryResult.summary;
                coolFacts = summaryResult.cool_facts;
            }
        } catch (readmeError) {
            console.warn('README fetch failed:', readmeError);
            readmeSummary = 'README 파일을 찾을 수 없습니다.';
            coolFacts = ['README 파일을 분석할 수 없습니다.'];
        }
        return {
            type: 'repository',
            repository: `${owner}/${repo}`,
            url: `https://github.com/${owner}/${repo}`,
            name: repoData.name,
            description: repoData.description,
            summary: readmeSummary || repoData.description || `${owner}/${repo} 저장소`,
            cool_facts: coolFacts,
            readmeContent: options?.includeFullReadme ? readmeContent : undefined,
            insights: {
                primaryLanguage: repoData.language,
                languages: Object.keys(languages),
                topics: repoData.topics || [],
                lastUpdated: repoData.updated_at,
                createdAt: repoData.created_at,
                stars: repoData.stargazers_count,
                forks: repoData.forks_count,
                issues: repoData.open_issues_count,
                size: repoData.size,
                defaultBranch: repoData.default_branch,
                isPrivate: repoData.private,
                hasWiki: repoData.has_wiki,
                hasPages: repoData.has_pages
            },
            owner: {
                login: repoData.owner.login,
                type: repoData.owner.type,
                avatarUrl: repoData.owner.avatar_url
            }
        };

    } catch (error) {
        console.error('Repository summary error:', error);
        return {
            type: 'repository',
            repository: `${owner}/${repo}`,
            summary: `저장소 ${owner}/${repo}의 정보를 가져오는데 실패했습니다.`,
            error: 'Failed to fetch repository data'
        };
    }
}

// 이 함수들은 이제 lib/chain.ts로 이동되었습니다

export async function POST(request: NextRequest) {
    try {
        // IP 기반 Rate Limiting  
        const clientIP = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            request.headers.get('cf-connecting-ip') || // Cloudflare
            'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';
        const rateLimit = checkRateLimit(clientIP, 10, 15 * 60 * 1000); // 15분에 10번까지 (GitHub API는 더 관대하게)

        if (!rateLimit.allowed) {
            SecurityLogger.log({
                type: 'RATE_LIMIT_EXCEEDED',
                ip: clientIP,
                userAgent,
                details: { resetTime: rateLimit.resetTime }
            });

            return NextResponse.json(
                {
                    success: false,
                    error: 'Too many requests. Please try again later.',
                    resetTime: rateLimit.resetTime
                },
                { status: 429 }
            );
        }

        // 이제 apiKey는 request body에서 안 받아올 거야! 헤더에서만 받을 거니까 주의해줘~☆
        // We'll only get the apiKey from the x-api-key header, not from the request body! (๑˃̵ᴗ˂̵)و
        const { githubUrl, options } = await request.json();
        const apiKey = request.headers.get('x-api-key');

        // API 키 검증
        if (!apiKey || typeof apiKey !== 'string') {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'missing_api_key' }
            });

            return NextResponse.json(
                { success: false, error: 'API key is required' },
                { status: 400 }
            );
        }

        // API 키 형식 검증 (예: marunose- 로 시작하는지)
        if (!apiKey.startsWith('marunose-')) {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'invalid_api_key_prefix', keyPrefix: apiKey.substring(0, 10) }
            });

            return NextResponse.json(
                { success: false, error: 'Invalid API key format' },
                { status: 400 }
            );
        }

        // GitHub URL 검증
        if (!githubUrl || typeof githubUrl !== 'string') {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'missing_github_url' }
            });

            return NextResponse.json(
                { success: false, error: 'GitHub URL is required' },
                { status: 400 }
            );

        }

        // GitHub URL 형식 검증 (사용자 프로필 + 저장소 모두 허용)
        const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+(?:\/[\w\-\.]+)?(?:\/)?$/;
        if (!githubUrlPattern.test(githubUrl)) {
            SecurityLogger.log({
                type: 'INVALID_FORMAT',
                ip: clientIP,
                userAgent,
                details: { reason: 'invalid_github_url', url: githubUrl }
            });

            return NextResponse.json(
                { success: false, error: 'Invalid GitHub URL format' },
                { status: 400 }
            );
        }

        // 서버에서 API 키 유효성 검증
        const allKeys = await apiKeyService.getAllKeys();
        const foundKey = allKeys.find(key => key.key === apiKey.trim() && key.is_active);

        if (!foundKey) {
            SecurityLogger.log({
                type: 'API_KEY_VALIDATION',
                ip: clientIP,
                userAgent,
                details: { success: false, keyPrefix: apiKey.substring(0, 10), service: 'github-summarize' }
            });

            return NextResponse.json(
                { success: false, error: 'Invalid or inactive API key' },
                { status: 401 }
            );
        }

        // API 키 사용량 체크
        if (foundKey.usage >= foundKey.monthly_limit) {
            SecurityLogger.log({
                type: 'API_KEY_VALIDATION',
                ip: clientIP,
                userAgent,
                details: { success: false, reason: 'usage_limit_exceeded', keyId: foundKey.id }
            });

            return NextResponse.json(
                { success: false, error: 'Monthly usage limit exceeded' },
                { status: 429 }
            );
        }

        // ✅ API 키 검증 성공 - 사용량 증가
        await apiKeyService.incrementUsage(foundKey.id);

        SecurityLogger.log({
            type: 'API_KEY_VALIDATION',
            ip: clientIP,
            userAgent,
            details: {
                success: true,
                keyId: foundKey.id,
                service: 'github-summarize',
                githubUrl: githubUrl,
                usage: foundKey.usage + 1
            }
        });

        // 실제 GitHub README 요약 로직
        const summaryResult = await generateGitHubSummary(githubUrl, options);

        return NextResponse.json({
            success: true,
            data: summaryResult,
            usage: {
                current: foundKey.usage + 1,
                limit: foundKey.monthly_limit,
                remaining: foundKey.monthly_limit - (foundKey.usage + 1)
            }
        });

    } catch (error) {
        console.error('GitHub summarize error:', error);

        SecurityLogger.log({
            type: 'API_KEY_VALIDATION',
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            details: { success: false, error: 'internal_server_error' }
        });

        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
