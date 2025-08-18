// OpenAI API를 사용한 GitHub README 요약 체인
// LangChain 스타일의 구조화된 요약 서비스

interface SummaryChainInput {
    readmeContent: string;
    options?: {
        maxTokens?: number;
        temperature?: number;
        includeFullContent?: boolean;
    };
}

interface SummaryChainOutput {
    summary: string;
    cool_facts: string[];
    success: boolean;
    source: 'openai' | 'fallback';
}

interface GitHubRepo {
    name: string;
    description: string;
    language: string;
    stargazers_count: number;
    forks_count: number;
    updated_at: string;
}

/**
 * GitHub README 요약을 위한 체인 클래스
 * OpenAI API를 사용하여 구조화된 요약을 생성합니다.
 */
export class GitHubSummaryChain {
    private apiKey: string | undefined;
    private defaultOptions = {
        maxTokens: 1000,
        temperature: 0.3,
        model: 'gpt-3.5-turbo'
    };

    constructor(apiKey?: string) {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    }

    /**
     * README 내용을 요약합니다.
     */
    async invoke(input: SummaryChainInput): Promise<SummaryChainOutput> {
        const { readmeContent, options = {} } = input;
        const mergedOptions = { ...this.defaultOptions, ...options };

        // OpenAI API 사용 가능한 경우
        if (this.apiKey) {
            try {
                return await this.invokeOpenAI(readmeContent, mergedOptions);
            } catch (error) {
                console.warn('OpenAI chain failed, falling back to local analysis:', error);
            }
        }

        // 폴백: 로컬 분석
        return this.invokeFallback(readmeContent);
    }

    /**
     * OpenAI API를 사용한 요약
     */
    private async invokeOpenAI(content: string, options: { maxTokens: number; temperature: number; model: string }): Promise<SummaryChainOutput> {
        // 컨텐츠 길이 제한 (토큰 절약)
        const truncatedContent = content.length > 8000 ? content.substring(0, 8000) + '...' : content;

        const prompt = this.buildPrompt();

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: options.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at analyzing GitHub repositories. Return your response as a JSON object with exactly these fields: "summary" (string) and "cool_facts" (array of strings).'
                    },
                    {
                        role: 'user',
                        content: prompt.replace('{readmeContent}', truncatedContent)
                    }
                ],
                temperature: options.temperature,
                max_tokens: options.maxTokens,
            }),
        });

        if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const contentText = data.choices[0]?.message?.content;

        if (!contentText) {
            throw new Error('No content received from OpenAI');
        }

        // JSON 응답 파싱
        try {
            const parsed = JSON.parse(contentText);
            return {
                summary: parsed.summary || 'Summary not available',
                cool_facts: Array.isArray(parsed.cool_facts) ? parsed.cool_facts : ['No cool facts available'],
                success: true,
                source: 'openai'
            };
        } catch {
            // JSON 파싱 실패 시 텍스트 그대로 사용
            return {
                summary: contentText.substring(0, 500) + (contentText.length > 500 ? '...' : ''),
                cool_facts: ['AI analysis completed with unstructured output'],
                success: true,
                source: 'openai'
            };
        }
    }

    /**
     * 폴백 분석 (로컬 처리)
     */
    private invokeFallback(content: string): SummaryChainOutput {
        try {
            const analysis = this.analyzeContent(content);

            return {
                summary: analysis.summary,
                cool_facts: analysis.coolFacts,
                success: true,
                source: 'fallback'
            };
        } catch (error) {
            console.error('Fallback analysis failed:', error);
            return {
                summary: 'Unable to analyze repository content',
                cool_facts: ['Content analysis failed'],
                success: false,
                source: 'fallback'
            };
        }
    }

    /**
     * 프롬프트 템플릿 생성
     */
    private buildPrompt(): string {
        return `Analyze this GitHub repository README and provide:

1. A comprehensive summary of what this repository is about, its main purpose, and key features
2. A list of cool or interesting facts about the repository (e.g., technologies used, unique features, impressive stats, etc.)

README Content:
{readmeContent}

Please respond in JSON format with fields "summary" and "cool_facts".

Example response format:
{
  "summary": "A detailed description of the repository...",
  "cool_facts": [
    "Uses cutting-edge technology X",
    "Has over 1000 stars",
    "Supports multiple platforms"
  ]
}`;
    }

    /**
     * 로컬 컨텐츠 분석
     */
    private analyzeContent(content: string): { summary: string; coolFacts: string[] } {
        const lines = content.split('\n');
        const headers = lines.filter(line => line.startsWith('#')).slice(0, 5);
        const nonEmptyLines = lines.filter(line => line.trim() && !line.startsWith('#')).slice(0, 10);

        let summary = '';

        // 제목 추출
        if (headers.length > 0) {
            const title = headers[0].replace(/^#+\s*/, '');
            summary += `${title} - `;
        }

        // 첫 번째 문단 추출
        const firstParagraph = nonEmptyLines.find(line =>
            !line.startsWith('```') &&
            !line.startsWith('![') &&
            !line.startsWith('[') &&
            line.length > 20
        );

        if (firstParagraph) {
            summary += firstParagraph.slice(0, 200);
            if (firstParagraph.length > 200) {
                summary += '...';
            }
        }

        // Cool facts 생성
        const coolFacts = this.extractCoolFacts(content, headers);

        return {
            summary: summary || 'This repository contains code and documentation.',
            coolFacts
        };
    }

    /**
     * Cool facts 추출
     */
    private extractCoolFacts(content: string, headers: string[]): string[] {
        const facts: string[] = [];

        // 문서화 수준
        if (content.length > 1000) {
            facts.push('Contains comprehensive documentation');
        }

        // 주요 섹션들
        const importantSections = headers.filter(header =>
            /installation|usage|getting started|features|about|api|examples/i.test(header)
        );

        if (importantSections.length > 0) {
            facts.push(`Includes sections: ${importantSections.map(h => h.replace(/^#+\s*/, '')).join(', ')}`);
        }

        // 기술 스택 감지
        const techKeywords = [
            'react', 'vue', 'angular', 'typescript', 'javascript', 'python',
            'java', 'go', 'rust', 'next.js', 'node.js', 'docker', 'kubernetes'
        ];

        const foundTech = techKeywords.filter(tech =>
            content.toLowerCase().includes(tech)
        );

        if (foundTech.length > 0) {
            facts.push(`Uses technologies: ${foundTech.slice(0, 5).join(', ')}`);
        }

        // 배지 감지 (CI/CD, 품질 등)
        const badgeCount = (content.match(/!\[.*?\]\(https:\/\/.*?\.svg\)/g) || []).length;
        if (badgeCount > 0) {
            facts.push(`Includes ${badgeCount} status badges for quality assurance`);
        }

        // 코드 예제 감지
        const codeBlocks = (content.match(/```/g) || []).length / 2;
        if (codeBlocks > 0) {
            facts.push(`Contains ${Math.floor(codeBlocks)} code examples`);
        }

        // 최소한의 facts 보장
        if (facts.length === 0) {
            facts.push('Well-documented repository');
        }

        return facts;
    }
}

/**
 * 사용자 프로필 분석을 위한 체인
 */
export class GitHubUserChain {
    /**
     * 사용자 프로필과 저장소 목록을 분석합니다.
     */
    static async analyzeUser(username: string): Promise<{
        type: 'user_profile';
        username: string;
        name?: string;
        bio?: string;
        summary: string;
        stats: {
            publicRepos: number;
            followers: number;
            following: number;
            location: string | null;
            company: string | null;
            blog: string | null;
            createdAt: string;
        };
        recentRepositories: {
            name: string;
            description: string | null;
            language: string | null;
            stars: number;
            forks: number;
            updatedAt: string;
        }[];
    }> {
        try {
            // GitHub API로 사용자 정보 가져오기
            const userResponse = await fetch(`https://api.github.com/users/${username}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Summarizer/1.0'
                }
            });

            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user data: ${userResponse.status}`);
            }

            const userData = await userResponse.json();

            // 사용자의 최근 저장소들 가져오기
            const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'GitHub-Summarizer/1.0'
                }
            });

            const reposData = reposResponse.ok ? await reposResponse.json() : [];

            return {
                type: 'user_profile',
                username: userData.login,
                name: userData.name,
                bio: userData.bio,
                summary: `${userData.name || userData.login}는 ${userData.public_repos}개의 공개 저장소를 가진 GitHub 사용자입니다. ${userData.followers}명의 팔로워와 ${userData.following}명을 팔로우하고 있습니다.`,
                stats: {
                    publicRepos: userData.public_repos,
                    followers: userData.followers,
                    following: userData.following,
                    location: userData.location,
                    company: userData.company,
                    blog: userData.blog,
                    createdAt: userData.created_at
                },
                recentRepositories: reposData.slice(0, 5).map((repo: GitHubRepo) => ({
                    name: repo.name,
                    description: repo.description,
                    language: repo.language,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                    updatedAt: repo.updated_at
                }))
            };

        } catch (error) {
            console.error('User profile analysis error:', error);
            return {
                type: 'user_profile',
                username: username,
                summary: `GitHub 사용자 ${username}의 정보를 가져오는데 실패했습니다.`,
                stats: {
                    publicRepos: 0,
                    followers: 0,
                    following: 0,
                    location: null,
                    company: null,
                    blog: null,
                    createdAt: ''
                },
                recentRepositories: []
            };
        }
    }
}

/**
 * 체인 팩토리 - 간편한 체인 생성
 */
export class ChainFactory {
    /**
     * GitHub 요약 체인 생성
     */
    static createSummaryChain(apiKey?: string): GitHubSummaryChain {
        return new GitHubSummaryChain(apiKey);
    }

    /**
     * README 요약 실행 (원라이너)
     */
    static async summarizeReadme(content: string, apiKey?: string): Promise<SummaryChainOutput> {
        const chain = new GitHubSummaryChain(apiKey);
        return await chain.invoke({ readmeContent: content });
    }

    /**
     * 사용자 분석 실행 (원라이너)
     */
    static async analyzeUser(username: string) {
        return await GitHubUserChain.analyzeUser(username);
    }
}
