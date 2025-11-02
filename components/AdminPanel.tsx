import React, { useState, useEffect } from 'react';
import type { Regulation } from '../types';
import { getRegulations, addRegulation, updateRegulation } from '../services/regulationService';
import { ScrollIcon } from './icons/ScrollIcon';
import Spinner from './Spinner';

const AdminPanel: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form state
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRegulations = () => {
    setRegulations(getRegulations().sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  useEffect(() => {
    fetchRegulations();
    setIsLoading(false);
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
    setIsFormVisible(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        await addRegulation({ name, link, interpretation, isVerified });
        fetchRegulations();
        resetForm();
    } catch (error) {
        console.error("Failed to add regulation:", error);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div className="flex items-center space-x-3">
            <ScrollIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Admin Panel: Manage Regulations</h2>
        </div>
        {!isFormVisible && (
             <button
                onClick={() => setIsFormVisible(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Add New Regulation
            </button>
        )}
      </div>

      {isFormVisible && (
        <div className="mb-6 p-4 border rounded-md bg-gray-50 animate-fade-in-down">
            <h3 className="text-lg font-semibold mb-3">New Regulation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="reg-name" className="block text-sm font-medium text-gray-700">Regulation Name</label>
                    <input type="text" id="reg-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="reg-link" className="block text-sm font-medium text-gray-700">Official Link</label>
                    <input type="url" id="reg-link" value={link} onChange={e => setLink(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="reg-interp" className="block text-sm font-medium text-gray-700">Interpretation for AI</label>
                    <textarea id="reg-interp" value={interpretation} onChange={e => setInterpretation(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
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

      <div className="space-y-3">
        {regulations.map(reg => (
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
      </div>
    </div>
  );
};

export default AdminPanel;
