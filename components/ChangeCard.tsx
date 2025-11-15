
import React from 'react';
import type { SuggestedChange } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { generateCombinedDiffHtml } from '../utils/diff';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface ChangeCardProps {
  change: SuggestedChange;
  onStatusChange: (changeId: string, newStatus: 'accepted' | 'rejected') => void;
  isSelected: boolean;
  onClick: () => void;
}

const severityClasses: {[key: string]: string} = {
  'Critical': 'border-red-500 bg-red-50 text-red-800',
  'High': 'border-orange-500 bg-orange-50 text-orange-800',
  'Medium': 'border-yellow-500 bg-yellow-50 text-yellow-800',
  'Low': 'border-blue-500 bg-blue-50 text-blue-800',
};

const severityBadgeClasses: {[key: string]: string} = {
  'Critical': 'bg-red-200 text-red-800',
  'High': 'bg-orange-200 text-orange-800',
  'Medium': 'bg-yellow-200 text-yellow-800',
  'Low': 'bg-blue-200 text-blue-800',
}

const ChangeCard: React.FC<ChangeCardProps> = ({ change, onStatusChange, isSelected, onClick }) => {
  const severityClass = severityClasses[change.severity] || 'border-gray-300 bg-gray-50 text-gray-800';
  const badgeClass = severityBadgeClasses[change.severity] || 'bg-gray-200 text-gray-800';
  
  return (
    <div onClick={onClick} className={`p-4 border-l-4 rounded-r-lg cursor-pointer transition-all ${severityClass.split(' ')[0]} ${isSelected ? 'shadow-lg scale-[1.02] bg-white' : `${severityClass.split(' ')[1]} hover:shadow-md`}`}>
        <div className="flex justify-between items-start">
            <div>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${badgeClass}`}>{change.severity}</span>
                <p className="text-sm text-gray-700 mt-2 flex items-start">
                    <LightbulbIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{change.reason}</span>
                </p>
            </div>
            <div className="flex space-x-2 flex-shrink-0 ml-4">
                <button title="Accept" onClick={(e) => { e.stopPropagation(); onStatusChange(change.id, 'accepted'); }} className={`p-1 rounded-full transition-colors ${change.status === 'accepted' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-green-100 hover:text-green-600'}`}>
                    <CheckCircleIcon className="h-6 w-6" />
                </button>
                <button title="Reject" onClick={(e) => { e.stopPropagation(); onStatusChange(change.id, 'rejected'); }} className={`p-1 rounded-full transition-colors ${change.status === 'rejected' ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-red-100 hover:text-red-600'}`}>
                    <XCircleIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
        <div className="mt-3 p-3 bg-white rounded-md text-xs leading-relaxed border">
            <div
                className="whitespace-pre-wrap font-mono"
                dangerouslySetInnerHTML={{ __html: generateCombinedDiffHtml(change.originalText, change.suggestedText) }}
            />
        </div>
    </div>
  );
};

export default ChangeCard;