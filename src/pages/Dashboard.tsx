import React from 'react';
import { Home, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import { useOpenAI } from '../context/OpenAIContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Dashboard() {
  const { state } = useOpenAI();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isConnected || !state.client) {
      toast.error('Please connect to OpenAI first');
      navigate('/');
    }
  }, [state.isConnected, state.client, navigate]);

  const handleOpenDashboard = () => {
    window.open('https://platform.openai.com/assistants', '_blank');
  };

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl">
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <Home className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          </div>
        </div>
        
        <div className="p-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="p-4 bg-blue-900/20 rounded-lg inline-block mx-auto">
              <Home className="w-12 h-12 text-blue-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-white">
              OpenAI Assistants Dashboard
            </h2>
            
            <p className="text-gray-400">
              Access your OpenAI Assistants dashboard to manage all your assistants, view analytics,
              and configure advanced settings directly on the OpenAI platform.
            </p>

            <button
              onClick={handleOpenDashboard}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900/20 hover:bg-blue-900/30
                text-white rounded-lg transition-colors border border-blue-900/50"
            >
              Open Assistants Dashboard
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}