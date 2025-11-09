
import type { Regulation } from '../types';
import { fetchApi } from './api';


export const getRegulations = async (): Promise<Regulation[]> => {
    try {
        // The /sources endpoint seems to be the one for regulations
        const sources = await fetchApi<Regulation[]>('/sources');
        // Sort by creation date descending
        return sources.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
        console.error("Failed to fetch regulations:", error);
        return []; // Return empty array on error
    }
};
