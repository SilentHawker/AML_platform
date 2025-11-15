
import { fetchApi } from './api';

export interface MasterPrompt {
  id: string;
  name: string;
  description?: string;
  prompt_text: string;
  category?: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export const listMasterPrompts = async (isActive: boolean = true): Promise<MasterPrompt[]> => {
  return fetchApi<MasterPrompt[]>(`/api/v1/master-prompts?is_active=${isActive}`);
};

export const getMasterPrompt = async (promptId: string): Promise<MasterPrompt> => {
  return fetchApi<MasterPrompt>(`/api/v1/master-prompts/${promptId}`);
};

export const createMasterPrompt = async (data: {
  name: string;
  prompt_text: string;
  description?: string;
  category?: string;
}): Promise<MasterPrompt> => {
  return fetchApi<MasterPrompt>('/api/v1/master-prompts', {
    method: 'POST',
    body: data
  });
};