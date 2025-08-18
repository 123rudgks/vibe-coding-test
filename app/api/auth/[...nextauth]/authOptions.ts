import { NextAuthOptions } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
    providers: [
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || '',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // 첫 로그인 시 사용자 정보를 토큰에 저장
            if (account && user) {
                token.accessToken = account.access_token
                token.provider = account.provider
                token.userId = user.id
            }
            return token
        },
        async session({ session, token }) {
            // 클라이언트에서 사용할 세션 정보 설정
            if (session.user) {
                session.user.id = token.userId as string
                session.accessToken = token.accessToken as string
                session.provider = token.provider as string
            }
            return session
        },
        async signIn({ account }) {
            // 로그인 허용 조건 설정
            if (account?.provider === 'github' || account?.provider === 'google') {
                return true
            }
            return false
        },
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30일
    },
    secret: process.env.NEXTAUTH_SECRET,
}
