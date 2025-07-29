'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiKeyService } from '../../lib/supabase';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { Sidebar } from '../../components/Sidebar';

export default function APIPlayground() {
    const [apiKey, setApiKey] = useState('');
    const [isValidated, setIsValidated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toasts, showError, showSuccess, removeToast } = useToast();

    const validateApiKey = async () => {
        if (!apiKey.trim()) {
            showError('Please enter an API key', '⚠️');
            return;
        }

        setIsLoading(true);

        try {
            // Get all API keys and check if the entered key exists and is active
            const allKeys = await apiKeyService.getAllKeys();
            const foundKey = allKeys.find(key => key.key === apiKey.trim() && key.is_active);

            if (foundKey) {
                showSuccess('API key is valid! Access granted.', '🎉');
                setIsValidated(true);
            } else {
                showError('Invalid API key. Please check your key and try again.', '❌');
            }
        } catch (error) {
            console.error('Error validating API key:', error);
            showError('Failed to validate API key. Please try again.', '❌');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        setIsValidated(false);
        setApiKey('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            validateApiKey();
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar currentPage="playground" />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>Pages</span>
                            <span className="mx-2">/</span>
                            <span>API Playground</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">API Playground</h1>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Operational</span>
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ← Back
                                </Link>
                            </div>
                        </div>
                    </div>

                    {isValidated ? (
                        // Protected Page View
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="max-w-md w-full">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center relative">
                                    {/* Back Button */}
                                    <button
                                        onClick={handleBack}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Go back"
                                    >
                                        ← Back
                                    </button>

                                    {/* Protected Page Content */}
                                    <div className="text-6xl mb-6">🛡️</div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        Protect Page
                                    </h1>
                                    <p className="text-gray-600 mb-6">
                                        Welcome to the protected area! Your API key has been validated successfully.
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-center">
                                            <span className="text-green-600 mr-2">✅</span>
                                            <span className="text-green-800 text-sm font-medium">
                                                API Access Granted
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // API Key Input View
                        <div className="flex items-center justify-center min-h-[60vh]">
                            <div className="max-w-md w-full">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                                    {/* Icon */}
                                    <div className="text-center mb-6">
                                        <div className="text-6xl mb-4">⚡</div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Enter API Key
                                        </h2>
                                        <p className="text-gray-600">
                                            Enter your API key to access the playground
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                API Key
                                            </label>
                                            <input
                                                type="text"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Enter your API key..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <button
                                            onClick={validateApiKey}
                                            disabled={isLoading || !apiKey.trim()}
                                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                    Validating...
                                                </>
                                            ) : (
                                                'Access Playground'
                                            )}
                                        </button>
                                    </div>

                                    {/* Help Text */}
                                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                        <div className="flex items-start">
                                            <span className="text-blue-600 mr-2 mt-0.5">💡</span>
                                            <div className="text-sm text-blue-800">
                                                <p className="font-medium mb-1">Need an API key?</p>
                                                <p>
                                                    Go to your{' '}
                                                    <Link href="/dashboard" className="underline font-medium">
                                                        dashboard
                                                    </Link>{' '}
                                                    to create and manage your API keys.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
} 