import { useState } from 'react';

interface AddApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateKey: (name: string, monthlyLimit: number) => Promise<boolean>;
}

export function AddApiKeyModal({ isOpen, onClose, onCreateKey }: AddApiKeyModalProps) {
    const [keyName, setKeyName] = useState('');
    const [keyLimit, setKeyLimit] = useState('1000');

    const handleSubmit = async () => {
        if (!keyName.trim() || !keyLimit.trim()) return;

        const success = await onCreateKey(keyName, parseInt(keyLimit));
        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setKeyName('');
        setKeyLimit('1000');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Create a new API key</h2>
                <p className="text-sm text-gray-600 mb-6">Enter a name and limit for the new API key.</p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Key Name — A unique name to identify this key
                        </label>
                        <input
                            type="text"
                            value={keyName}
                            onChange={(e) => setKeyName(e.target.value)}
                            placeholder="Key Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Limit monthly usage*
                        </label>
                        <input
                            type="number"
                            value={keyLimit}
                            onChange={(e) => setKeyLimit(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            * If the combined usage of all your keys exceeds your plan's limit, all requests will be rejected.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!keyName.trim() || !keyLimit.trim()}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
} 