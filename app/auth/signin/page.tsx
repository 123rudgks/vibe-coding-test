'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Provider {
    id: string
    name: string
    type: string
    signinUrl: string
    callbackUrl: string
}

export default function SignIn() {
    const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
    const [loading, setLoading] = useState('')

    useEffect(() => {
        const loadProviders = async () => {
            const res = await getProviders()
            setProviders(res)
        }
        loadProviders()
    }, [])

    const handleSignIn = async (providerId: string) => {
        setLoading(providerId)
        try {
            await signIn(providerId, { callbackUrl: '/dashboard' })
        } catch (error) {
            console.error('Sign in error:', error)
        } finally {
            setLoading('')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">T</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                        Sign in to Tavily AI
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Access your API dashboard and manage your keys
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    {providers && Object.values(providers).map((provider) => (
                        <button
                            key={provider.name}
                            onClick={() => handleSignIn(provider.id)}
                            disabled={loading === provider.id}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${provider.id === 'github'
                                    ? 'bg-gray-800 hover:bg-gray-900 focus:ring-gray-500'
                                    : provider.id === 'google'
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {loading === provider.id ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <span className="text-lg">
                                        {provider.id === 'github' ? '🐙' :
                                            provider.id === 'google' ? '🔍' : '🔑'}
                                    </span>
                                )}
                            </span>
                            {loading === provider.id ? 'Signing in...' : `Continue with ${provider.name}`}
                        </button>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">
                                Secure authentication powered by NextAuth.js
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link
                        href="/"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
