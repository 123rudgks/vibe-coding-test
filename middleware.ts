import { withAuth } from "next-auth/middleware"

export default withAuth(
    // `withAuth`로 감싸여진 이 함수는 토큰이 존재할 때만 호출됩니다
    function middleware(req) {
        // 여기서 추가적인 인증 로직을 수행할 수 있습니다
        console.log("Middleware executed for:", req.nextUrl.pathname)
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // 토큰이 있으면 접근 허용
                if (token) return true

                // 로그인 관련 페이지들은 토큰 없이도 접근 허용
                const { pathname } = req.nextUrl
                if (
                    pathname === "/" ||
                    pathname.startsWith("/auth/") ||
                    pathname.startsWith("/api/auth/")
                ) {
                    return true
                }

                // 그 외의 모든 페이지는 인증 필요
                return false
            },
        },
        pages: {
            signIn: "/", // 인증되지 않은 사용자를 홈페이지(로그인 페이지)로 리디렉션
        },
    }
)

// 미들웨어가 적용될 경로 설정
export const config = {
    matcher: [
        /*
         * 다음 경로들을 제외한 모든 경로에 적용:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public 폴더의 파일들
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
