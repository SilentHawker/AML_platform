import React, { useMemo } from 'react';
import type { SuggestedChange } from '../types';
import { generateCombinedDiffHtml } from '../utils/diff';

interface FullPolicyViewProps {
  originalText: string;
  changes: SuggestedChange[];
}

const FullPolicyView: React.FC<FullPolicyViewProps> = ({ originalText, changes }) => {
  const newText = useMemo(() => {
    let updatedText = originalText || '';
    
    const appliedChanges = changes.filter(c => c.status === 'accepted' || c.status === 'modified');

    appliedChanges.forEach(change => {
        const textToInsert = (change.status === 'modified' ? change.modifiedText : change.suggestedText) || '';
        if (change.originalText && updatedText.includes(change.originalText)) {
            updatedText = updatedText.replace(change.originalText, textToInsert);
        }
    });

    return updatedText;
  }, [originalText, changes]);

  const diffHtml = useMemo(() => {
    return generateCombinedDiffHtml(originalText, newText);
  }, [originalText, newText]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Full Document View</h3>
      <div 
        className="text-sm max-w-none leading-relaxed whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: diffHtml }} 
      />
    </div>
  );
};

export default FullPolicyView;
