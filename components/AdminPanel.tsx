
import React, { useState, useEffect } from 'react';
import type { Regulation, AIModelConfig, BusinessLine } from '../types';
import { getRegulations, addRegulation, updateRegulation } from '../services/regulationService';
import { getModelConfigs, addModelConfig, updateModelConfig, deleteModelConfig, setAsDefaultModelConfig } from '../services/modelConfigService';
import { getMasterPrompt, updateMasterPrompt } from '../services/promptService';
import { ScrollIcon } from './icons/ScrollIcon';
import { CpuChipIcon } from './icons/CpuChipIcon';
import { DocumentTextIcon } from './icons/DocumentTextIcon';
import { UsersIcon } from './icons/UsersIcon';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

// --- Individual Manager Components ---

const ClientManager: React.FC = () => {
    const { adminCreateClient, startImpersonation } = useAuth();
    const [companyName, setCompanyName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const newUser = await adminCreateClient(companyName, email);
            setSuccessMessage(`Client ${newUser.tenantName} created! Starting onboarding...`);
            setTimeout(() => {
                startImpersonation(newUser.tenantId, newUser.tenantName);
            }, 1500);
        } catch(err: any) {
            setError(err.message || 'Failed to create client.');
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            <p className="text-sm text-gray-600 mb-4">
                Onboard new clients by creating their account. After creation, you will be automatically guided through the onboarding questionnaire on their behalf.
            </p>
            <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-3">Onboard New Client</h3>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                {successMessage && <p className="bg-green-100 text-green-700 p-3 rounded-md mb-4 text-sm">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">Company Name</label>
                        <input type="text" id="company-name" placeholder="e.g., ACME Corporation" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                    </div>
                     <div>
                        <label htmlFor="client-email" className="block text-sm font-medium text-gray-700">Client Contact Email</label>
                        <input type="email" id="client-email" placeholder="e.g., contact@acme.com" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                    </div>
                     <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? <><Spinner/> Creating...</> : 'Create & Onboard Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const MasterPromptManager: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        setPrompt(getMasterPrompt());
        setIsLoading(false);
    }, []);

    const handleSave = () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            updateMasterPrompt(prompt);
            setTimeout(() => {
                setIsSaving(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            }, 500);
        } catch (e) {
            console.error("Failed to save prompt", e);
            setIsSaving(false);
        }
    };

    return (
        <div>
             <p className="text-sm text-gray-600 mb-4">
                This is the core system instruction given to the AI for every analysis. Tweaking this prompt will change the AI's persona, constraints, and the structure of its output.
            </p>
            {isLoading ? <Spinner /> : (
                <div className="space-y-4">
                    <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={15}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono bg-white text-gray-900"
                        placeholder="Enter the master system prompt here..."
                    />
                    <div className="flex justify-end items-center space-x-4">
                        {saveSuccess && <span className="text-sm text-green-600 font-semibold animate-fade-in">Saved successfully!</span>}
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSaving ? <><Spinner /> Saving...</> : 'Save Master Prompt'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

const ModelConfigManager: React.FC = () => {
  const [configs, setConfigs] = useState<AIModelConfig[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIModelConfig | null>(null);

  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchConfigs = () => {
    setConfigs(getModelConfigs().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    fetchConfigs();
  }, []);
  
  const resetForm = () => {
    setEditingConfig(null);
    setModelName('');
    setApiKey('');
    setDescription('');
    setIsFormVisible(false);
  };
  
  const handleEdit = (config: AIModelConfig) => {
    setEditingConfig(config);
    setModelName(config.modelName);
    setApiKey(config.apiKey);
    setDescription(config.description);
    setIsFormVisible(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this model configuration?")) {
        deleteModelConfig(id);
        fetchConfigs();
    }
  };

  const handleSetDefault = (id: string) => {
    setAsDefaultModelConfig(id);
    fetchConfigs();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const configData = { modelName, apiKey, description, isDefault: editingConfig?.isDefault || false };
    
    try {
        if (editingConfig) {
            updateModelConfig({ ...editingConfig, ...configData });
        } else {
            addModelConfig(configData);
        }
        fetchConfigs();
        resetForm();
    } catch(error) {
        console.error("Failed to save model config", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length < 8) return '****';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  return (
    <div>
        <div className="flex items-center justify-end mb-4">
            {!isFormVisible && (
                <button
                    onClick={() => setIsFormVisible(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Add New Model
                </button>
            )}
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-4">
            <p className="text-sm text-yellow-800">
                <span className="font-bold">⚠️ Security Warning:</span> API keys should never be managed in the browser. This is for demonstration only.
            </p>
        </div>
        {isFormVisible && (
            <div className="mb-6 p-4 border rounded-md bg-gray-50 animate-fade-in-down">
                <h3 className="text-lg font-semibold mb-3">{editingConfig ? "Edit Model" : "New Model"}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="model-desc" className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" id="model-desc" placeholder="e.g., Advanced Reasoning Model" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="model-name" className="block text-sm font-medium text-gray-700">Model Name</label>
                        <input type="text" id="model-name" placeholder="e.g., gemini-2.5-pro" value={modelName} onChange={e => setModelName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                    </div>
                    <div>
                        <label htmlFor="model-key" className="block text-sm font-medium text-gray-700">API Key</label>
                        <input type="password" id="model-key" value={apiKey} onChange={e => setApiKey(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? <><Spinner/> Saving...</> : 'Save Model'}
                        </button>
                    </div>
                </form>
            </div>
        )}
        <div className="space-y-3">
            {configs.map(config => (
                <div key={config.id} className="p-4 border rounded-md shadow-sm flex items-center justify-between">
                    <div>
                        <h4 className="font-bold text-gray-800">{config.description}</h4>
                        <p className="text-sm text-gray-600 font-mono">{config.modelName}</p>
                        <p className="text-sm text-gray-500 font-mono">API Key: {maskApiKey(config.apiKey)}</p>
                    </div>
                    <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                        {config.isDefault ? (
                             <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">Default</span>
                        ) : (
                            <button onClick={() => handleSetDefault(config.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Set as Default</button>
                        )}
                        <button onClick={() => handleEdit(config)} className="text-sm font-medium text-gray-600 hover:text-gray-900">Edit</button>
                        <button onClick={() => handleDelete(config.id)} className="text-sm font-medium text-red-600 hover:text-red-800">Delete</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  )
}

const RegulationManager: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
  const [activeBusinessLine, setActiveBusinessLine] = useState<BusinessLine>('MSBs');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
  const [businessLineForNew, setBusinessLineForNew] = useState<BusinessLine>('MSBs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX: Updated businessLines to match the actual BusinessLine type. Replaced 'Real Estate' with 'Financial Entities'.
  const businessLines: BusinessLine[] = ['MSBs', 'Securities Dealers', 'Financial Entities', 'Casinos'];

  const fetchRegulations = () => {
    setRegulations(getRegulations().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    fetchRegulations();
  }, []);

  const handleToggleVerification = async (regulation: Regulation) => {
    try {
        await updateRegulation({ ...regulation, isVerified: !regulation.isVerified });
        fetchRegulations();
    } catch (error) {
        console.error("Failed to update regulation:", error);
    }
  };
  
  const resetForm = () => {
    setName('');
    setLink('');
    setInterpretation('');
    setIsVerified(false);
    // FIX: Corrected typo from 'MSB' to 'MSBs' to match BusinessLine type.
    setBusinessLineForNew('MSBs');
    setIsFormVisible(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await addRegulation({ name, link, interpretation, isVerified, businessLine: businessLineForNew });
        fetchRegulations();
        resetForm();
    } catch (error) {
        console.error("Failed to add regulation:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const filteredRegulations = regulations.filter(r => r.businessLine === activeBusinessLine);

    return (
        <div>
             <div className="flex items-center justify-end mb-4">
                {!isFormVisible && (
                    <button
                        onClick={() => setIsFormVisible(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add New Regulation
                    </button>
                )}
            </div>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {businessLines.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveBusinessLine(tab)}
                            className={`${
                                activeBusinessLine === tab
                                    ? 'border-blue-600 text-blue-700'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {isFormVisible && (
                <div className="mb-6 p-4 border rounded-md bg-gray-50 animate-fade-in-down">
                    <h3 className="text-lg font-semibold mb-3">New Regulation</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Regulation Name</label>
                            <input type="text" id="reg-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="reg-link" className="block text-sm font-medium text-gray-700">Official Link</label>
                            <input type="url" id="reg-link" value={link} onChange={e => setLink(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="reg-interp" className="block text-sm font-medium text-gray-700">Interpretation for AI</label>
                            <textarea id="reg-interp" value={interpretation} onChange={e => setInterpretation(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"></textarea>
                        </div>
                        <div>
                            <label htmlFor="reg-business-line" className="block text-sm font-medium text-gray-700">Business Line</label>
                            <select
                                id="reg-business-line"
                                value={businessLineForNew}
                                onChange={e => setBusinessLineForNew(e.target.value as BusinessLine)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white text-gray-900"
                            >
                                {businessLines.map(line => <option key={line} value={line}>{line}</option>)}
                            </select>
                        </div>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                            <input id="reg-verified" type="checkbox" checked={isVerified} onChange={e => setIsVerified(e.target.checked)} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            </div>
                            <div className="ml-3 text-sm">
                            <label htmlFor="reg-verified" className="font-medium text-gray-700">Verified for Analysis</label>
                            <p className="text-gray-500">Only verified regulations will be used by the AI.</p>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                                {isSubmitting ? <><Spinner/> Saving...</> : 'Save Regulation'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            <div className="space-y-3 pb-6">
                {filteredRegulations.map(reg => (
                    <div key={reg.id} className="p-4 border rounded-md shadow-sm flex items-start justify-between">
                        <div>
                            <h4 className="font-bold text-gray-800">{reg.name}</h4>
                            <a href={reg.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{reg.link}</a>
                            <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 border-l-2">{reg.interpretation}</p>
                        </div>
                        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${reg.isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {reg.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <button onClick={() => handleToggleVerification(reg)} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                {reg.isVerified ? 'Unverify' : 'Verify'}
                            </button>
                        </div>
                    </div>
                ))}
                 {filteredRegulations.length === 0 && !isFormVisible && (
                    <p className="text-center text-gray-500 py-8">No regulations found for this business line.</p>
                )}
            </div>
        </div>
    )
}

// --- Main AdminPanel Component ---

type AdminTab = 'clients' | 'regulations' | 'models' | 'prompt';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('clients');

    const tabs: { id: AdminTab; name: string; icon: React.FC<{className?: string}>; component: React.FC }[] = [
        { id: 'clients', name: 'Client Management', icon: UsersIcon, component: ClientManager },
        { id: 'regulations', name: 'Regulations', icon: ScrollIcon, component: RegulationManager },
        { id: 'models', name: 'AI Models', icon: CpuChipIcon, component: ModelConfigManager },
        { id: 'prompt', name: 'Master Prompt', icon: DocumentTextIcon, component: MasterPromptManager },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => null);
    const activeTabInfo = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 flex min-h-[600px]">
            <aside className="w-64 border-r border-gray-200 p-4">
                <nav className="flex flex-col space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium w-full text-left transition-colors ${
                                activeTab === tab.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-6">
                 {activeTabInfo && (
                    <div className="flex items-center space-x-3 mb-6 border-b border-gray-200 pb-4">
                        <activeTabInfo.icon className="h-7 w-7 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">{activeTabInfo.name}</h2>
                    </div>
                 )}
                <ActiveComponent />
            </main>
        </div>
    );
};

export default AdminPanel;
