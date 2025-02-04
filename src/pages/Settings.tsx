import React, { useState } from 'react';
import { Settings as SettingsIcon, Bot, AlertTriangle, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useOpenAI } from '../context/OpenAIContext';
import { useNavigate } from 'react-router-dom';

interface AssistantFormData {
  name: string;
  instructions: string;
  model: string;
}

export default function Settings() {
  const { state } = useOpenAI();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [formData, setFormData] = useState<AssistantFormData>({
    name: state.selectedAssistant?.name || '',
    instructions: state.selectedAssistant?.instructions || '',
    model: state.selectedAssistant?.model || '',
  });

  // Redirect if no assistant is selected
  if (!state.selectedAssistant || !state.client) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!state.client || !state.selectedAssistant) return;

    setIsLoading(true);
    try {
      await state.client.beta.assistants.update(
        state.selectedAssistant.id,
        {
          name: formData.name,
          instructions: formData.instructions,
          model: formData.model,
        }
      );
      
      // Close the dialog and show success state
      setShowConfirmDialog(false);
      // You might want to refresh the assistant data in your context here
    } catch (error) {
      console.error('Error updating assistant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl">
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Assistant Settings</h1>
          </div>
        </div>
        
        <div className="p-6">
          <div className="max-w-2xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-blue-900/30 rounded-lg">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">Assistant Configuration</h2>
                <p className="text-gray-400">
                  Modify your assistant's settings. These changes will affect the assistant's behavior
                  across all applications where it's being used.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      text-white placeholder-gray-500 hover:border-blue-700 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-200 mb-1">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      text-white placeholder-gray-500 min-h-[150px] resize-y hover:border-blue-700 transition-all"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    These instructions define how your assistant behaves and responds.
                  </p>
                </div>

                <div>
                  <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-1">
                    Model
                  </label>
                  <select
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none
                      text-white hover:border-blue-700 transition-all appearance-none"
                    required
                  >
                    {state.availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white
                    rounded-lg transition-all border border-blue-900/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-950 border border-blue-900/50 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 text-yellow-500 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Confirm Changes</h3>
            </div>
            
            <p className="text-gray-300 mb-6">
              You are about to update this assistant's configuration. These changes will affect the assistant's
              behavior across all applications and users that interact with it. Are you sure you want to proceed?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpdate}
                disabled={isLoading}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500
                  rounded-lg transition-all border border-yellow-500/50
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  'Confirm Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}