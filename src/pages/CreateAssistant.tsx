import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOpenAI } from '../context/OpenAIContext';
import Layout from '../components/Layout';
import { toast } from 'sonner';

export default function CreateAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, createAssistant } = useOpenAI();
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [model, setModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (location.state?.characterData) {
      const { characterData } = location.state;
      setName(characterData.name);
      setInstructions(JSON.stringify(characterData, null, 2));
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createAssistant({ name, instructions, model });
      toast.success('Assistant created successfully');
      navigate('/chat');
    } catch (error) {
      console.error('Error creating assistant:', error);
      toast.error('Failed to create assistant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create OpenAI Assistant</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
              Assistant Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-200 mb-1">
              Instructions (Character File)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full h-64 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-200 mb-1">
              Model
            </label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {state.availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Assistant'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
