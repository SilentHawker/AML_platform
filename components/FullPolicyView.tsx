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
    
    // Create a stable order for applying changes to avoid one change interfering with another's find/replace
    const sortedChanges = [...changes].sort((a, b) => (originalText.indexOf(a.originalText)) - (originalText.indexOf(b.originalText)));

    const appliedChanges = sortedChanges.filter(c => c.status === 'accepted' || c.status === 'modified');

    // This simple replace can be fragile if originalText snippets are not unique.
    // For a production app, a more robust patching strategy (like diff-match-patch) would be better.
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
    <div className="bg-white p-6 rounded-lg shadow-inner border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-3">Full Document Preview</h3>
      <div 
        className="text-sm max-w-none leading-relaxed whitespace-pre-wrap prose prose-sm"
        dangerouslySetInnerHTML={{ __html: diffHtml }} 
      />
    </div>
  );
};

export default FullPolicyView;