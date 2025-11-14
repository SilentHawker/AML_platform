import React, { useState, useRef, useEffect } from 'react';
import type { Policy } from '../types';
import { FileTextIcon } from './icons/FileTextIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import PolicyUpload from './PolicyUpload';
import { UploadIcon } from './icons/UploadIcon';
import Spinner from './Spinner';
import PolicyGenerator from './PolicyGenerator';
import { SparklesIcon } from './icons/SparklesIcon';


// Declare globals from CDN scripts
declare const jspdf: any;
declare const docx: any;
declare const saveAs: (blob: Blob, filename: string) => void;

interface PolicyManagerProps {
  policies: Policy[];
  onStartReview: (policyId: string) => void;
}

const PolicyCard: React.FC<{ policy: Policy; onStartReview: (policyId: string) => void }> = ({ policy, onStartReview }) => {
    const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isHistoryVisible, setHistoryVisible] = useState(false);
    
    const isSimulated = policy.id.startsWith('simulated-');


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDownloadMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleHistory = () => {
        // History is now just viewing past versions, which is not implemented in this view
        setHistoryVisible(!isHistoryVisible);
    };
    
    const handleDownload = (format: 'txt' | 'pdf' | 'docx') => {
        setDownloadMenuOpen(false); // Close menu on selection
        const latestVersion = policy.versions.find(v => v.version === policy.currentVersion);
        if (!latestVersion) return;

        const filename = `${(policy.name || 'policy').replace(/\s+/g, '_')}_v${policy.currentVersion}`;
        const policyText = latestVersion.text;

        if (format === 'txt') {
            const blob = new Blob([policyText], { type: 'text/plain;charset=utf-8' });
            saveAs(blob, `${filename}.txt`);
        } else if (format === 'pdf') {
            const { jsPDF } = jspdf;
            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;
            const textLines = doc.splitTextToSize(policyText, doc.internal.pageSize.width - margin * 2);
            
            let y = margin;
            textLines.forEach((line: string) => {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin, y);
                y += 7; // Line height
            });
    
            doc.save(`${filename}.pdf`);
        } else if (format === 'docx') {
            const docInstance = new docx.Document({
                sections: [{
                    children: policyText.split('\n').map(line => new docx.Paragraph({
                        children: [new docx.TextRun(line)],
                    })),
                }],
            });
    
            docx.Packer.toBlob(docInstance).then((blob: Blob) => {
                saveAs(blob, `${filename}.docx`);
            });
        }
    };
    
    return (
        <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between transition-shadow hover:shadow-lg">
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{policy.name}</h3>
                    {policy.status === 'Active' ? (
                        <span className="flex items-center text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            <ShieldCheckIcon className="h-4 w-4 mr-1" /> Active
                        </span>
                    ) : (
                        <span className="flex items-center text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full animate-pulse">
                            <XCircleIcon className="h-4 w-4 mr-1" /> Review Required
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Version {policy.currentVersion}.0 | Last updated: {new Date(policy.versions.find(v=>v.version === policy.currentVersion)?.createdAt ?? Date.now()).toLocaleDateString()}
                </p>
                {isSimulated && <p className="text-xs text-orange-600 font-semibold mt-1">Note: This is a temporary preview and is not saved to the server.</p>}
            </div>
            <div className="mt-4 flex items-center justify-end space-x-2">
                 <button
                    onClick={toggleHistory}
                    disabled // Re-enable when version history view is built
                    className="flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <HistoryIcon className="h-5 w-5 mr-2 text-gray-500" />
                    History
                </button>
                <div className="relative inline-block text-left" ref={dropdownRef}>
                    <div>
                        <button
                            type="button"
                            onClick={() => setDownloadMenuOpen(prev => !prev)}
                            className="flex items-center justify-center w-full px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            id={`menu-button-${policy.id}`}
                            aria-expanded={isDownloadMenuOpen}
                            aria-haspopup="true"
                        >
                            <DownloadIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Download
                            <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5 text-gray-400" />
                        </button>
                    </div>

                    {isDownloadMenuOpen && (
                        <div
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                            role="menu"
                            aria-orientation="vertical"
                            aria-labelledby={`menu-button-${policy.id}`}
                        >
                            <div className="py-1" role="none">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('txt'); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">As Text (.txt)</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('pdf'); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">As PDF (.pdf)</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('docx'); }} className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">As Word (.docx)</a>
                            </div>
                        </div>
                    )}
                </div>

                {policy.status === 'Review Required' && (
                    <button 
                        onClick={() => onStartReview(policy.id)}
                        className="flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Review Changes
                    </button>
                )}
            </div>
             {isHistoryVisible && (
                <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in-down">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">Version History</h4>
                    <p className="text-sm text-gray-500 text-center py-4">Version history view is not yet implemented.</p>
                </div>
            )}
        </div>
    );
};

const PolicyManager: React.FC<PolicyManagerProps> = ({ policies, onStartReview }) => {
  const [activeForm, setActiveForm] = useState<'none' | 'upload' | 'generate'>('none');

  const handleUploadComplete = (newPolicyId: string) => {
    setActiveForm('none');
    onStartReview(newPolicyId);
  };

  const handleGenerationComplete = (newPolicyId: string) => {
    setActiveForm('none');
    onStartReview(newPolicyId);
  };
  
  const isFormOpen = activeForm !== 'none';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4 border-b pb-3">
        <div className="flex items-center space-x-3">
            <FileTextIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">My Compliance Policies</h2>
        </div>
        {!isFormOpen && (
            <div className="flex items-center space-x-3">
                 <button
                    onClick={() => setActiveForm('generate')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Policy (AI)
                </button>
                <button
                    onClick={() => setActiveForm('upload')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <UploadIcon className="h-5 w-5 mr-2" />
                    Upload New Policy
                </button>
            </div>
        )}
      </div>

      {activeForm === 'upload' && (
        <PolicyUpload 
            onUploadComplete={handleUploadComplete}
            onCancel={() => setActiveForm('none')}
        />
      )}

      {activeForm === 'generate' && (
        <PolicyGenerator
            onGenerationComplete={handleGenerationComplete}
            onCancel={() => setActiveForm('none')}
        />
      )}

      {!isFormOpen && (
        policies.length === 0 ? (
          <p className="text-center text-gray-500 py-8">You have not uploaded any policies yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {policies.map(policy => (
              <PolicyCard key={policy.id} policy={policy} onStartReview={onStartReview} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PolicyManager;