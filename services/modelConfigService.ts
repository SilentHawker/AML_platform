import type { AIModelConfig } from '../types';

const MOCK_MODELS: AIModelConfig[] = [
    {
        id: 'model-1',
        modelName: 'gemini-2.5-pro',
        apiKey: process.env.API_KEY || 'REPLACE_WITH_GEMINI_2.5_PRO_KEY',
        description: 'Gemini 2.5 Pro (Advanced Reasoning)',
        isDefault: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'model-2',
        modelName: 'gemini-2.5-flash',
        apiKey: process.env.API_KEY || 'REPLACE_WITH_GEMINI_2.5_FLASH_KEY',
        description: 'Gemini 2.5 Flash (Fast & Efficient)',
        isDefault: false,
        createdAt: new Date().toISOString(),
    },
];

const initializeData = () => {
    if (!localStorage.getItem('modelConfigs')) {
        localStorage.setItem('modelConfigs', JSON.stringify(MOCK_MODELS));
    }
};

initializeData();

export const getModelConfigs = (): AIModelConfig[] => {
    const configs = localStorage.getItem('modelConfigs');
    return configs ? JSON.parse(configs) : [];
};

export const getModelConfigById = (id: string): AIModelConfig | undefined => {
    return getModelConfigs().find(c => c.id === id);
};

export const getDefaultModelConfig = (): AIModelConfig | undefined => {
    return getModelConfigs().find(c => c.isDefault);
};

export const addModelConfig = (data: Omit<AIModelConfig, 'id' | 'createdAt'>): AIModelConfig => {
    let configs = getModelConfigs();
    const newConfig: AIModelConfig = {
        ...data,
        id: `model-${new Date().getTime()}`,
        createdAt: new Date().toISOString(),
    };

    if (newConfig.isDefault) {
        configs = configs.map(c => ({ ...c, isDefault: false }));
    }

    configs.push(newConfig);
    localStorage.setItem('modelConfigs', JSON.stringify(configs));
    return newConfig;
};

export const updateModelConfig = (updatedConfig: AIModelConfig): AIModelConfig => {
    let configs = getModelConfigs();
    const index = configs.findIndex(c => c.id === updatedConfig.id);
    if (index === -1) {
        throw new Error('Model configuration not found');
    }

    if (updatedConfig.isDefault) {
        configs = configs.map(c => ({ ...c, isDefault: false }));
    }
    
    configs[index] = updatedConfig;
    localStorage.setItem('modelConfigs', JSON.stringify(configs));
    return updatedConfig;
};

export const deleteModelConfig = (id: string): void => {
    let configs = getModelConfigs();
    const configToDelete = configs.find(c => c.id === id);
    if (!configToDelete) return;
    
    configs = configs.filter(c => c.id !== id);
    
    // If the deleted model was the default, make another one default if possible
    if (configToDelete.isDefault && configs.length > 0) {
        configs[0].isDefault = true;
    }

    localStorage.setItem('modelConfigs', JSON.stringify(configs));
};


export const setAsDefaultModelConfig = (id: string): void => {
    let configs = getModelConfigs();
    configs = configs.map(c => ({
        ...c,
        isDefault: c.id === id,
    }));
    localStorage.setItem('modelConfigs', JSON.stringify(configs));
}
