import React, { useState, useEffect } from 'react';
import type { MasterPrompt } from '../services/promptService';
import { listMasterPrompts, createMasterPrompt, updateMasterPrompt } from '../services/promptService';
import Spinner from './Spinner';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';

// Form component for creating and editing prompts
interface PromptFormProps {
    promptToEdit: MasterPrompt | null;
    onSave: () => void;
    onCancel: () => void;
}

const PromptForm: React.FC<PromptFormProps> = ({ promptToEdit, onSave, onCancel }) => {
    const isEditing = !!promptToEdit;
    
    const [name, setName] = useState(promptToEdit?.name || '');
    const [description, setDescription] = useState(promptToEdit?.description || '');
    const [promptText, setPromptText] = useState(promptToEdit?.prompt_text || '');
    const [isActive, setIsActive] = useState(promptToEdit?.is_active ?? true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const promptData = {
                name,
                description,
                prompt_text: promptText,
                is_active: isActive,
            };

            if (isEditing) {
                await updateMasterPrompt(promptToEdit.id, promptData);
            } else {
                await createMasterPrompt(promptData);
            }
            onSave();
        } catch (err: any) {
            setError(err.message || `Failed to ${isEditing ? 'update' : 'create'} prompt.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 border rounded-md bg-gray-50 animate-fade-in-down mb-6">
            <h3 className="text-lg font-semibold mb-3">{isEditing ? 'Edit Master Prompt' : 'Create New Master Prompt'}</h3>
            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="prompt-name" className="block text-sm font-medium text-gray-700">Prompt Name</label>
                    <input type="text" id="prompt-name" placeholder="e.g., Standard MSB Policy Prompt" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                </div>
                 <div>
                    <label htmlFor="prompt-desc" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea id="prompt-desc" value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                </div>
                 <div>
                    <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700">Prompt Text</label>
                    <textarea id="prompt-text" value={promptText} onChange={e => setPromptText(e.target.value)} required rows={8} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono bg-white text-gray-900" />
                </div>
                <fieldset>
                    <legend className="block text-sm font-medium text-gray-700">Status</legend>
                    <div className="mt-2 flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="status" checked={isActive} onChange={() => setIsActive(true)} className="focus:ring-blue-500 h-4 w-4 border-gray-300" />
                            <span>Active</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="status" checked={!isActive} onChange={() => setIsActive(false)} className="focus:ring-blue-500 h-4 w-4 border-gray-300" />
                            <span>Inactive</span>
                        </label>
                    </div>
                </fieldset>
                 <div className="flex justify-end space-x-3">
                     <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                        {isSubmitting ? <><Spinner/> Saving...</> : (isEditing ? 'Save Changes' : 'Save Prompt')}
                    </button>
                </div>
            </form>
        </div>
    );
};


// Main manager component
const MasterPromptManager: React.FC = () => {
    const [prompts, setPrompts] = useState<MasterPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingPrompt, setEditingPrompt] = useState<MasterPrompt | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const fetchPrompts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedPrompts = await listMasterPrompts(false); // Fetch all, active and inactive
            setPrompts(fetchedPrompts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } catch (err: any) {
            setError(err.message || "Failed to load prompts.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);
    
    const handleCreate = () => {
        setEditingPrompt(null);
        setIsFormVisible(true);
    };

    const handleEdit = (prompt: MasterPrompt) => {
        setEditingPrompt(prompt);
        setIsFormVisible(true);
    };

    const handleSave = () => {
        setIsFormVisible(false);
        setEditingPrompt(null);
        fetchPrompts(); // Refresh the list
    };

    const handleCancel = () => {
        setIsFormVisible(false);
        setEditingPrompt(null);
    };

    if (isFormVisible) {
        return <PromptForm promptToEdit={editingPrompt} onSave={handleSave} onCancel={handleCancel} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                    Manage the master prompts used by the AI to generate baseline policies for clients.
                </p>
                <button onClick={handleCreate} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create New Prompt
                </button>
            </div>
            
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : 
             error ? <p className="text-red-600 text-center p-4">{error}</p> : (
                <div className="space-y-3 pb-6">
                    {prompts.map(prompt => (
                        <div key={prompt.id} className="p-4 border rounded-md shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{prompt.name} <span className="text-sm font-normal text-gray-500">(v{prompt.version})</span></h4>
                                <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                                <details className="mt-2 text-xs">
                                    <summary className="cursor-pointer text-blue-600 hover:underline">View Prompt Text</summary>
                                    <pre className="mt-1 p-2 bg-gray-100 rounded-md whitespace-pre-wrap font-mono text-gray-700 max-h-48 overflow-y-auto">{prompt.prompt_text}</pre>
                                </details>
                            </div>
                            <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {prompt.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <button onClick={() => handleEdit(prompt)} title="Edit Prompt" className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-200 transition-colors">
                                    <EditIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {prompts.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No master prompts found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MasterPromptManager;
