import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Loader2, Check, AlertCircle, ExternalLink, ChevronDown, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useOpenAI } from '../context/OpenAIContext';
import type { Assistant } from 'openai/resources/beta/assistants/assistants';
import MouseGlow from './effects/MouseGlow';

interface CreateAssistantFormData {
  name: string;
  instructions: string;
  model: string;
}

const DEFAULT_MODEL = 'gpt-4o-mini';

export default function LoginForm() {
  const navigate = useNavigate();
  const { state, connect, selectAssistant, createAssistant, proceedToChat } = useOpenAI();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAssistantDropdownOpen, setIsAssistantDropdownOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateAssistantFormData>({
    name: '',
    instructions: '',
    model: DEFAULT_MODEL,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await connect(apiKey);
      toast.success('Successfully connected to OpenAI');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to connect. Please check your API key.';
      setError(errorMessage);
      toast.error('Connection failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssistantSelect = (assistant: Assistant) => {
    selectAssistant(assistant);
    setIsAssistantDropdownOpen(false);
    toast.success('Assistant selected', {
      description: `Now using ${assistant.name || 'Unnamed Assistant'}`
    });
  };

  const handleCreateAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const assistant = await createAssistant(createFormData);
      toast.success('Assistant created successfully', {
        description: `Created ${assistant.name}`
      });
      setShowCreateForm(false);
      setCreateFormData({
        name: '',
        instructions: '',
        model: DEFAULT_MODEL,
      });
    } catch (error: any) {
      toast.error('Failed to create assistant', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950 p-4 overflow-hidden">
      <MouseGlow />
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="p-8 bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-blue-900/50 rounded-lg mx-auto flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Connect to OpenAI</h2>
            <p className="text-zinc-400 text-sm">
              Enter your OpenAI API key to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="apiKey" className="text-sm font-medium text-zinc-200 block">
                  API Key
                </label>
                <button
                  type="button"
                  onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-900/80 border rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none 
                    text-white placeholder-zinc-500 transition-all
                    group-hover:border-blue-700
                    ${state.isConnected ? 'border-blue-500/50 opacity-75' : 'border-blue-900/50'}`}
                  placeholder="sk-..."
                  required
                  disabled={state.isConnected}
                  autoComplete="current-password"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {state.isConnected ? (
                    <Check className="w-5 h-5 text-blue-400" />
                  ) : error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-500 mt-1">
                  {error}
                </p>
              )}
            </div>

            {!state.isConnected && (
              <button
                type="submit"
                disabled={isLoading || !apiKey}
                className="w-full py-2.5 px-4 rounded-lg font-medium transition-all
                  flex items-center justify-center gap-2
                  bg-blue-900/20 hover:bg-blue-900/30
                  text-white disabled:opacity-50 disabled:cursor-not-allowed
                  border border-blue-900/50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            )}
          </form>

          {state.isConnected && !showCreateForm && (
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-200 block">
                  Select Assistant
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsAssistantDropdownOpen(!isAssistantDropdownOpen)}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      flex items-center justify-between text-left
                      hover:border-blue-700 transition-all"
                  >
                    <span className="text-zinc-300">
                      {state.selectedAssistant?.name || 'Select an assistant...'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${
                      isAssistantDropdownOpen ? 'transform rotate-180' : ''
                    }`} />
                  </button>
                  
                  {isAssistantDropdownOpen && (
                    <div className="absolute z-10 w-full mt-2 bg-gray-900/80 border border-blue-900/50 rounded-lg shadow-xl
                      max-h-48 overflow-y-auto overscroll-contain backdrop-blur-sm">
                      {state.assistants.map((assistant) => (
                        <button
                          key={assistant.id}
                          onClick={() => handleAssistantSelect(assistant)}
                          className="w-full px-4 py-2 text-left hover:bg-blue-900/20 text-zinc-300
                            flex items-center gap-2 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-900/50 flex items-center justify-center">
                            <Key className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {assistant.name || 'Unnamed Assistant'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium
                    bg-gray-900/80 hover:bg-blue-900/20
                    text-zinc-300 hover:text-white
                    transition-all flex items-center justify-center gap-2
                    border border-blue-900/50 hover:border-blue-700/50"
                >
                  <Plus className="w-4 h-4" />
                  Create New
                </button>

                <button
                  onClick={() => proceedToChat(navigate)}
                  disabled={!state.selectedAssistant}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium
                    bg-blue-900/20 hover:bg-blue-900/30
                    text-white transition-all
                    flex items-center justify-center gap-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border border-blue-900/50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {state.isConnected && showCreateForm && (
            <form onSubmit={handleCreateAssistant} className="space-y-4 pt-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create New Assistant</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="p-1 hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium text-zinc-200 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      text-white placeholder-zinc-500 hover:border-blue-700 transition-all"
                    placeholder="My Assistant"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="text-sm font-medium text-zinc-200 block mb-1">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={createFormData.instructions}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      text-white placeholder-zinc-500 min-h-[100px] resize-y hover:border-blue-700 transition-all"
                    placeholder="You are a helpful assistant that..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="model" className="text-sm font-medium text-zinc-200 block mb-1">
                    Model
                  </label>
                  <div className="relative">
                    <select
                      id="model"
                      value={createFormData.model}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                        text-white appearance-none hover:border-blue-700 transition-all"
                      required
                    >
                      {state.availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Using recommended model (gpt-4o-mini). Change only if needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium
                    bg-gray-900/80 hover:bg-blue-900/20
                    text-zinc-300 hover:text-white
                    transition-all border border-blue-900/50 hover:border-blue-700/50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !createFormData.name || !createFormData.instructions || !createFormData.model}
                  className="flex-1 py-2.5 px-4 rounded-lg font-medium
                    bg-blue-900/20 hover:bg-blue-900/30
                    text-white transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border border-blue-900/50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    'Create Assistant'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            <p className="text-xs text-zinc-500 text-center">
              Your API key is stored locally and never sent to our servers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}