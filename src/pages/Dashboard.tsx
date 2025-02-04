import React from 'react';
import { Home, ExternalLink, Bot, Code, Sparkles, Workflow } from 'lucide-react';
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

  const features = [
    {
      icon: Bot,
      title: "AI Assistants",
      description: "Learn how to create and customize AI assistants that can understand context and maintain engaging conversations."
    },
    {
      icon: Code,
      title: "API Integration",
      description: "Explore the OpenAI API and understand how to integrate AI capabilities into your applications."
    },
    {
      icon: Sparkles,
      title: "Natural Language Processing",
      description: "Discover how AI processes and understands human language to provide meaningful responses."
    },
    {
      icon: Workflow,
      title: "Conversation Flow",
      description: "Master the art of designing effective conversation flows and prompt engineering for AI interactions."
    }
  ];

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
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Existing Content */}
            <div className="text-center space-y-6">
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

            {/* Educational Content */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  Getting Started with AI Development
                </h3>
                <p className="text-gray-400">
                  The OpenAI Assistants API provides a powerful platform for creating intelligent 
                  conversational agents. Learn how to leverage these tools to build sophisticated 
                  AI-powered applications.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="bg-gray-900/40 rounded-lg p-6 border border-blue-900/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-900/30 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-white">{feature.title}</h4>
                      </div>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-900/30">
                <h4 className="text-lg font-semibold text-white mb-4">
                  Workshop Learning Points
                </h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Understand the fundamentals of AI assistant development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Learn to integrate OpenAI's API into your applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Master prompt engineering and conversation design</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Explore best practices for AI application development</span>
                  </li>
                </ul>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>
                  Part of the AI Workshop series - Learning to build and understand AI-powered applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}