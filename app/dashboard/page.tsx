'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useApiKeys } from '../../hooks/useApiKeys';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../../components/Toast';
import { AddApiKeyModal } from '../../components/AddApiKeyModal';
import { ApiKeyTable } from '../../components/ApiKeyTable';
import { Sidebar } from '../../components/Sidebar';

export default function Dashboard() {
    const [showAddModal, setShowAddModal] = useState(false);
    const { toasts, showSuccess, showError, removeToast } = useToast();
    const {
        apiKeys,
        loading,
        error,
        visibleKeys,
        totalUsage,
        createKey,
        updateKey,
        deleteKey,
        toggleKeyVisibility,
        copyToClipboard,
        clearError,
    } = useApiKeys({ showSuccess, showError });

    const handleCreateKey = async (name: string, monthlyLimit: number) => {
        const success = await createKey(name, monthlyLimit);
        if (success) {
            setShowAddModal(false);
        }
        return success;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar currentPage="dashboard" />

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <span>Pages</span>
                            <span className="mx-2">/</span>
                            <span>Overview</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Operational</span>
                                </div>
                                <div className="text-sm text-gray-600">67%</div>
                                <Link
                                    href="/"
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ← Back
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <span className="text-red-600 mr-2">⚠️</span>
                                <span className="text-red-800 text-sm">{error}</span>
                                <button
                                    onClick={clearError}
                                    className="ml-auto text-red-600 hover:text-red-800"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Current Plan Card */}
                    <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500 rounded-xl p-8 text-white mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="text-sm opacity-90 mb-2">CURRENT PLAN</div>
                                <h2 className="text-4xl font-bold">Researcher</h2>
                            </div>
                            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                📋 Manage Plan
                            </button>
                        </div>

                        <div>
                            <div className="flex items-center mb-2">
                                <span className="text-sm opacity-90">API Limit</span>
                                <span className="ml-2 text-xs opacity-75">ⓘ</span>
                            </div>
                            <div className="mb-2">
                                <div className="bg-white/20 rounded-full h-2">
                                    <div
                                        className="bg-white rounded-full h-2 transition-all duration-300"
                                        style={{ width: `${(totalUsage / 1000) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="text-sm opacity-90">{totalUsage}/1,000 Requests</div>
                        </div>
                    </div>

                    {/* API Keys Section */}
                    <ApiKeyTable
                        apiKeys={apiKeys}
                        loading={loading}
                        visibleKeys={visibleKeys}
                        onShowAddModal={() => setShowAddModal(true)}
                        onEditKey={updateKey}
                        onDeleteKey={deleteKey}
                        onToggleKeyVisibility={toggleKeyVisibility}
                        onCopyToClipboard={copyToClipboard}
                    />
                </div>
            </div>

            {/* Add API Key Modal */}
            <AddApiKeyModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onCreateKey={handleCreateKey}
            />

            {/* Toast Notifications */}
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
} 