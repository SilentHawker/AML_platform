import React, { useState, useCallback } from 'react';
import { analyzePolicy } from '../services/geminiService';
import { createPolicyAndReview } from '../services/policyService';
import Spinner from './Spinner';
import { UploadIcon } from './icons/UploadIcon';
import { useAuth } from '../hooks/useAuth';

// Declare globals from CDN scripts for parsing
declare const mammoth: any;
declare const pdfjsLib: any;

interface PolicyUploadProps {
  onUploadComplete: (newPolicyId: string) => void;
  onCancel: () => void;
}

const PolicyUpload: React.FC<PolicyUploadProps> = ({ onUploadComplete, onCancel }) => {
  const { user, impersonatedTenant } = useAuth();
  const [policyName, setPolicyName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const activeTenantId = impersonatedTenant?.tenantId || user?.tenantId;


  const handleFile = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    setError(null);
    setIsParsing(true);
    setFile(null);
    setFileContent('');

    try {
        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        let text = '';

        switch (extension) {
            case 'txt':
                text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = () => reject(new Error('Failed to read text file.'));
                    reader.readAsText(selectedFile);
                });
                break;
            
            case 'docx':
                text = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const arrayBuffer = e.target?.result as ArrayBuffer;
                            const result = await mammoth.extractRawText({ arrayBuffer });
                            resolve(result.value);
                        } catch (err) {
                            reject(new Error('Failed to parse .docx file. It may be corrupt or password-protected.'));
                        }
                    };
                    reader.onerror = () => reject(new Error('Failed to read .docx file.'));
                    reader.readAsArrayBuffer(selectedFile);
                });
                break;

            case 'pdf':
                const arrayBuffer = await selectedFile.arrayBuffer();
                // Configure the worker source for pdf.js
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const pageTexts = [];
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    pageTexts.push(pageText);
                }
                text = pageTexts.join('\n\n'); // Separate pages with double newline for clarity
                break;
            
            case 'doc':
                throw new Error("Legacy .doc files are not supported. Please save it as a .docx file and try again.");
            
            case 'odt':
                 throw new Error(".odt files are not yet supported. Please convert to .docx or .txt.");

            default:
                throw new Error(`Unsupported file type: .${extension}. Please use .txt, .docx, or .pdf.`);
        }
        
        setFileContent(text);
        setFile(selectedFile);
        if (!policyName) {
            setPolicyName(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }

    } catch (err: any) {
        setError(err.message || 'Failed to process file.');
        console.error("File processing error:", err);
    } finally {
        setIsParsing(false);
    }
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };
  
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
        handleFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        handleFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTenantId) {
        setError("Could not determine the active client. Please refresh and try again.");
        return;
    }
    if (!fileContent || !policyName) {
      setError("Please provide a policy name and upload a file.");
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const analysisResult = await analyzePolicy(fileContent);
      const newPolicy = createPolicyAndReview(policyName, fileContent, analysisResult, activeTenantId);
      onUploadComplete(newPolicy.id);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 animate-fade-in-down">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload New Policy</h3>
      {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="policyName" className="block text-sm font-medium text-gray-700">Policy Name</label>
          <input
            id="policyName"
            type="text"
            value={policyName}
            onChange={(e) => setPolicyName(e.target.value)}
            placeholder="e.g., Q3 2024 AML Policy"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Policy Document</label>
            <div 
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md transition-colors ${isDragOver ? 'bg-blue-50 border-blue-400' : ''}`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <div className="space-y-1 text-center">
                    {isParsing ? (
                        <>
                            <Spinner />
                            <p className="text-sm text-gray-600">Parsing your document...</p>
                        </>
                    ) : (
                        <>
                            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.docx,.pdf,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">Supported formats: TXT, DOCX, PDF</p>
                            <p className="text-xs text-gray-500">(.doc files should be saved as .docx)</p>
                            {file && <p className="text-sm font-semibold text-green-600 pt-2">Selected: {file.name}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isLoading || isParsing || !file} className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? <><Spinner /> Analyzing...</> : isParsing ? <><Spinner /> Parsing...</> : 'Upload & Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PolicyUpload;