'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.'
            case 'AccessDenied':
                return 'Access denied. You do not have permission to sign in.'
            case 'Verification':
                return 'The verification token is invalid or has expired.'
            case 'Default':
            default:
                return 'An error occurred during authentication. Please try again.'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 text-2xl">❌</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {getErrorMessage(error)}
                    </p>
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/signin"
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Try Again
                    </Link>

                    <Link
                        href="/"
                        className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Go Home
                    </Link>
                </div>

                {error && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600">
                            Error code: {error}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function AuthError() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
            <AuthErrorContent />
        </Suspense>
    )
}
