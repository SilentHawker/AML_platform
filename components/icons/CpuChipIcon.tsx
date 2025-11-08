import React from 'react';

export const CpuChipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V4m0 16v-2M8 9H7a1 1 0 00-1 1v4a1 1 0 001 1h1m8-6h1a1 1 0 011 1v4a1 1 0 01-1 1h-1M9 9h6v6H9V9z" />
    </svg>
);
