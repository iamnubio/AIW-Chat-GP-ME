import React, { createContext, useContext, useReducer } from 'react';
import OpenAI from 'openai';
import type { Assistant } from 'openai/resources/beta/assistants/assistants';

interface OpenAIState {
  isConnected: boolean;
  client: OpenAI | null;
  assistants: Assistant[];
  selectedAssistant: Assistant | null;
  availableModels: string[];
}

type OpenAIAction =
  | { type: 'CONNECT'; payload: OpenAI }
  | { type: 'SET_ASSISTANTS'; payload: Assistant[] }
  | { type: 'SELECT_ASSISTANT'; payload: Assistant }
  | { type: 'ADD_ASSISTANT'; payload: Assistant }
  | { type: 'SET_MODELS'; payload: string[] }
  | { type: 'DISCONNECT' };

const initialState: OpenAIState = {
  isConnected: false,
  client: null,
  assistants: [],
  selectedAssistant: null,
  availableModels: [],
};

const OpenAIContext = createContext<{
  state: OpenAIState;
  connect: (apiKey: string) => Promise<void>;
  selectAssistant: (assistant: Assistant) => void;
  createAssistant: (data: {
    name: string;
    instructions: string;
    model: string;
  }) => Promise<Assistant>;
  proceedToChat: (navigate: (path: string) => void) => void;
} | undefined>(undefined);

function openAIReducer(state: OpenAIState, action: OpenAIAction): OpenAIState {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        isConnected: true,
        client: action.payload,
      };
    case 'SET_ASSISTANTS':
      return {
        ...state,
        assistants: action.payload,
      };
    case 'SELECT_ASSISTANT':
      return {
        ...state,
        selectedAssistant: action.payload,
      };
    case 'ADD_ASSISTANT':
      return {
        ...state,
        assistants: [...state.assistants, action.payload],
        selectedAssistant: action.payload,
      };
    case 'SET_MODELS':
      return {
        ...state,
        availableModels: action.payload,
      };
    case 'DISCONNECT':
      return initialState;
    default:
      return state;
  }
}

export function OpenAIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(openAIReducer, initialState);

  const connect = async (apiKey: string) => {
    try {
      const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
      
      // Fetch available models
      const modelsResponse = await client.models.list();
      const assistantModels = modelsResponse.data
        .filter(model => model.id.startsWith('gpt-'))
        .map(model => model.id)
        .sort((a, b) => {
          // Prioritize gpt-4o-mini if it exists
          if (a === 'gpt-4o-mini') return -1;
          if (b === 'gpt-4o-mini') return 1;
          return b.localeCompare(a);
        });
      
      // Fetch assistants
      const assistantsResponse = await client.beta.assistants.list();
      
      dispatch({ type: 'CONNECT', payload: client });
      dispatch({ type: 'SET_MODELS', payload: assistantModels });
      dispatch({ type: 'SET_ASSISTANTS', payload: assistantsResponse.data });
    } catch (error) {
      throw error;
    }
  };

  const selectAssistant = (assistant: Assistant) => {
    dispatch({ type: 'SELECT_ASSISTANT', payload: assistant });
  };

  const createAssistant = async (data: {
    name: string;
    instructions: string;
    model: string;
  }) => {
    if (!state.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const assistant = await state.client.beta.assistants.create({
        name: data.name,
        instructions: data.instructions,
        model: data.model,
      });
      dispatch({ type: 'ADD_ASSISTANT', payload: assistant });
      return assistant;
    } catch (error) {
      throw error;
    }
  };

  const proceedToChat = (navigate: (path: string) => void) => {
    if (!state.selectedAssistant) return;
    navigate('/chat');
  };

  return (
    <OpenAIContext.Provider value={{ state, connect, selectAssistant, createAssistant, proceedToChat }}>
      {children}
    </OpenAIContext.Provider>
  );
}

export function useOpenAI() {
  const context = useContext(OpenAIContext);
  if (context === undefined) {
    throw new Error('useOpenAI must be used within an OpenAIProvider');
  }
  return context;
}