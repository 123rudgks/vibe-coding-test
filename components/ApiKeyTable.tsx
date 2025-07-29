import { useState } from 'react';
import { type ApiKey, displayApiKey } from '../types/api-key';
import { EditForm } from './EditForm';

interface ApiKeyTableProps {
    apiKeys: ApiKey[];
    loading: boolean;
    visibleKeys: Set<string>;
    onShowAddModal: () => void;
    onEditKey: (apiKey: ApiKey) => Promise<boolean>;
    onDeleteKey: (keyId: string) => Promise<boolean>;
    onToggleKeyVisibility: (keyId: string) => void;
    onCopyToClipboard: (text: string) => void;
}

export function ApiKeyTable({
    apiKeys,
    loading,
    visibleKeys,
    onShowAddModal,
    onEditKey,
    onDeleteKey,
    onToggleKeyVisibility,
    onCopyToClipboard,
}: ApiKeyTableProps) {
    const [editingKeyId, setEditingKeyId] = useState<string | null>(null);

    const handleEditStart = (apiKey: ApiKey) => {
        setEditingKeyId(apiKey.id);
    };

    const handleEditSave = async (updatedKey: ApiKey) => {
        const success = await onEditKey(updatedKey);
        if (success) {
            setEditingKeyId(null);
        }
    };

    const handleEditCancel = () => {
        setEditingKeyId(null);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">API Keys</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            The key is used to authenticate your requests to the{' '}
                            <a href="#" className="text-blue-600 hover:underline">Research API</a>.
                            To learn more, see the{' '}
                            <a href="#" className="text-blue-600 hover:underline">documentation</a> page.
                        </p>
                    </div>
                    <button
                        onClick={onShowAddModal}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading API keys...</p>
                </div>
            )}

            {/* Table Header */}
            {!loading && (
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-3">NAME</div>
                        <div className="col-span-2">USAGE</div>
                        <div className="col-span-5">KEY</div>
                        <div className="col-span-2 text-right">OPTIONS</div>
                    </div>
                </div>
            )}

            {/* Table Body */}
            {!loading && (
                <div className="divide-y divide-gray-200">
                    {apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="px-6 py-4">
                            {editingKeyId === apiKey.id ? (
                                <EditForm
                                    apiKey={apiKey}
                                    onSave={handleEditSave}
                                    onCancel={handleEditCancel}
                                />
                            ) : (
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    <div className="col-span-3">
                                        <span className="text-sm font-medium text-gray-900">{apiKey.name}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm text-gray-600">{apiKey.usage}</span>
                                    </div>
                                    <div className="col-span-5">
                                        <span className="text-sm font-mono text-gray-600">
                                            {displayApiKey(apiKey.key, apiKey.id, visibleKeys)}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end space-x-2">
                                        <button
                                            onClick={() => onToggleKeyVisibility(apiKey.id)}
                                            className={`p-1 transition-colors ${visibleKeys.has(apiKey.id)
                                                ? 'text-blue-600 hover:text-blue-800'
                                                : 'text-gray-400 hover:text-gray-600'
                                                }`}
                                            title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                                        >
                                            👁️
                                        </button>
                                        <button
                                            onClick={() => onCopyToClipboard(apiKey.key)}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleEditStart(apiKey)}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Edit key"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => onDeleteKey(apiKey.id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete key"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && apiKeys.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">🔑</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No API Keys Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Create your first API key to get started.
                    </p>
                    <button
                        onClick={onShowAddModal}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                        Create Your First API Key
                    </button>
                </div>
            )}
        </div>
    );
} 