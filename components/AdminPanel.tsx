
import React, { useState, useEffect } from 'react';
import type { Regulation, BusinessLine } from '../types';
import { getRegulations } from '../services/regulationService';
import { ScrollIcon } from './icons/ScrollIcon';
import { UsersIcon } from './icons/UsersIcon';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

// --- Individual Manager Components ---

const ClientManager: React.FC = () => {
    const { adminCreateClient, startImpersonation } = useAuth();
    const [companyName, setCompanyName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const newUser = await adminCreateClient(companyName);
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

const RegulationManager: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBusinessLine, setActiveBusinessLine] = useState<BusinessLine>('MSBs');

  const businessLines: BusinessLine[] = ['MSBs', 'Securities Dealers', 'Financial Entities', 'Casinos'];

  useEffect(() => {
    const fetchRegulations = async () => {
        setIsLoading(true);
        const fetchedRegulations = await getRegulations();
        setRegulations(fetchedRegulations);
        setIsLoading(false);
    };
    fetchRegulations();
  }, []);

  const filteredRegulations = regulations.filter(r => r.businessLine === activeBusinessLine);

    return (
        <div>
            <p className="text-sm text-gray-600 mb-4">
                View the regulatory sources used by the AI for analysis. Management of these sources is handled on the backend.
            </p>

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
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
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
                            </div>
                        </div>
                    ))}
                    {filteredRegulations.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No regulations found for this business line.</p>
                    )}
                </div>
            )}
        </div>
    )
}

// --- Main AdminPanel Component ---

type AdminTab = 'clients' | 'regulations';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('clients');

    const tabs: { id: AdminTab; name: string; icon: React.FC<{className?: string}>; component: React.FC }[] = [
        { id: 'clients', name: 'Client Management', icon: UsersIcon, component: ClientManager },
        { id: 'regulations', name: 'Regulations', icon: ScrollIcon, component: RegulationManager },
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