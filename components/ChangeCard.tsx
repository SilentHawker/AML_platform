import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { SuggestedChange } from '../types';
import { generateDiffHtml } from '../utils/diff';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { EditIcon } from './icons/EditIcon';

interface ChangeCardProps {
  change: SuggestedChange;
  onUpdate?: (change: SuggestedChange) => void;
  readOnly?: boolean;
}

const severityClasses = {
  'Critical': 'border-red-500 bg-red-50',
  'High': 'border-orange-500 bg-orange-50',
  'Medium': 'border-yellow-500 bg-yellow-50',
  'Low': 'border-blue-500 bg-blue-50',
};

const severityTextClasses = {
  'Critical': 'text-red-800 bg-red-200',
  'High': 'text-orange-800 bg-orange-200',
  'Medium': 'text-yellow-800 bg-yellow-200',
  'Low': 'text-blue-800 bg-blue-200',
};


const ChangeCard: React.FC<ChangeCardProps> = ({ change, onUpdate, readOnly = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(change.modifiedText ?? change.suggestedText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const removalHtml = useMemo(() => generateDiffHtml(change.originalText, change.suggestedText, 'removal'), [change.originalText, change.suggestedText]);
  const additionHtml = useMemo(() => generateDiffHtml(change.originalText, change.suggestedText, 'addition'), [change.originalText, change.suggestedText]);


  useEffect(() => {
    if (isEditing && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editText]);

  const handleStatusChange = (status: 'accepted' | 'rejected') => {
    if (readOnly || !onUpdate) return;
    setIsEditing(false);
    onUpdate({ ...change, status });
  };

  const handleModify = () => {
    if (readOnly || !onUpdate) return;
    setIsEditing(true);
  };
  
  const handleSaveModification = () => {
    if (readOnly || !onUpdate) return;
    onUpdate({ ...change, status: 'modified', modifiedText: editText });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(change.modifiedText ?? change.suggestedText);
    setIsEditing(false);
  };

  const statusDisplayInfo = {
    accepted: 'bg-green-100 text-green-800',
    modified: 'bg-yellow-100 text-yellow-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 transition-all ${severityClasses[change.severity]}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-gray-800">Suggested Change</h4>
        <span className={`px-2 py-1 text-xs font-bold rounded-full ${severityTextClasses[change.severity]}`}>
          Severity: {change.severity}
        </span>
      </div>
      
      {/* Diff Viewer */}
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Original</p>
          <div className="border bg-gray-50 rounded-md p-3 text-sm font-mono leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: removalHtml }} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Suggestion</p>
          <div className="border bg-gray-50 rounded-md p-3 text-sm font-mono leading-relaxed">
            <p dangerouslySetInnerHTML={{ __html: additionHtml }} />
          </div>
        </div>
      </div>


      {/* Reason */}
      <div className="mt-4 bg-blue-100 border-l-4 border-blue-400 p-3 rounded-r-md">
        <div className="flex items-start space-x-3">
          <LightbulbIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Reason for change:</p>
            <p className="text-sm text-blue-700">{change.reason}</p>
          </div>
        </div>
      </div>
      
      {/* Edit Mode */}
      {isEditing && (
        <div className="mt-4 p-3 bg-gray-100 border rounded-md">
            <label htmlFor={`edit-${change.id}`} className="block text-sm font-medium text-gray-700 mb-1">Modify Suggestion:</label>
            <textarea
                ref={textareaRef}
                id={`edit-${change.id}`}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                rows={4}
            />
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={handleCancelEdit} className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button onClick={handleSaveModification} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Save Change</button>
            </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isEditing && !readOnly && (
        <div className="mt-4 pt-4 border-t flex items-center justify-end space-x-2">
            <button
                onClick={() => handleStatusChange('rejected')}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${change.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'}`}
                aria-pressed={change.status === 'rejected'}
            >
                <XCircleIcon className="h-5 w-5" />
                <span>Reject</span>
            </button>
             <button
                onClick={handleModify}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${change.status === 'modified' ? 'bg-yellow-500 text-white' : 'bg-white text-yellow-600 border border-yellow-400 hover:bg-yellow-50'}`}
                aria-pressed={change.status === 'modified'}
            >
                <EditIcon className="h-5 w-5" />
                <span>Modify</span>
            </button>
            <button
                onClick={() => handleStatusChange('accepted')}
                className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${change.status === 'accepted' ? 'bg-green-600 text-white' : 'bg-white text-green-600 border border-green-400 hover:bg-green-50'}`}
                aria-pressed={change.status === 'accepted'}
            >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Accept</span>
            </button>
        </div>
      )}

      {readOnly && (
        <div className="mt-4 pt-3 border-t">
            <p className="text-sm font-semibold text-gray-700">Final Status: 
                <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${statusDisplayInfo[change.status]}`}>
                    {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                </span>
            </p>
        </div>
      )}
    </div>
  );
};

export default ChangeCard;