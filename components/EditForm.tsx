import { useState } from 'react';
import { type ApiKey } from '../types/api-key';

interface EditFormProps {
    apiKey: ApiKey;
    onSave: (apiKey: ApiKey) => void;
    onCancel: () => void;
}

export function EditForm({ apiKey, onSave, onCancel }: EditFormProps) {
    const [name, setName] = useState(apiKey.name);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ ...apiKey, name });
    };

    return (
        <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                />
            </div>
            <div className="col-span-2">
                <span className="text-sm text-gray-600">{apiKey.usage}</span>
            </div>
            <div className="col-span-5">
                <span className="text-sm font-mono text-gray-600">{apiKey.key.slice(0, 5)}***************************</span>
            </div>
            <div className="col-span-2 flex items-center justify-end space-x-2">
                <button
                    onClick={handleSave}
                    disabled={!name.trim()}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-xs transition-colors"
                >
                    Save
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
} 