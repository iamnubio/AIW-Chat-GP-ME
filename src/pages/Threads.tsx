import React from 'react';
import { Layers, ExternalLink, MessageSquare, GitBranch, Workflow, Brain } from 'lucide-react';
import Layout from '../components/Layout';
import { useOpenAI } from '../context/OpenAIContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Threads() {
  const { state } = useOpenAI();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isConnected || !state.client) {
      toast.error('Please connect to OpenAI first');
      navigate('/');
    }
  }, [state.isConnected, state.client, navigate]);

  const handleOpenThreads = () => {
    window.open('https://platform.openai.com/threads', '_blank');
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Conversation Management",
      description: "Threads maintain context and history of interactions between users and AI assistants, enabling coherent, multi-turn conversations."
    },
    {
      icon: GitBranch,
      title: "State Persistence",
      description: "Like Git branches, threads allow multiple conversation paths to be maintained separately, perfect for handling different user scenarios."
    },
    {
      icon: Workflow,
      title: "Context Control",
      description: "Threads help manage conversation context, allowing the AI to maintain relevant information throughout the interaction."
    },
    {
      icon: Brain,
      title: "Learning Pattern",
      description: "Understanding threads is crucial for AI development as they mirror human conversation patterns and memory retention."
    }
  ];

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl">
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Threads</h1>
          </div>
        </div>
        
        <div className="p-8">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Existing Content */}
            <div className="text-center space-y-6">
              <div className="p-4 bg-blue-900/20 rounded-lg inline-block mx-auto">
                <Layers className="w-12 h-12 text-blue-400" />
              </div>
              
              <h2 className="text-xl font-semibold text-white">
                Manage Your Threads
              </h2>
              
              <p className="text-gray-400">
                View and manage all your conversation threads directly on the OpenAI platform.
                This provides full access to your thread history and management tools.
              </p>

              <button
                onClick={handleOpenThreads}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900/20 hover:bg-blue-900/30
                  text-white rounded-lg transition-colors border border-blue-900/50"
              >
                Open Threads Dashboard
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            {/* Educational Content */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  Understanding OpenAI Threads
                </h3>
                <p className="text-gray-400">
                  In the context of AI development and interaction, threads are more than just conversation histories. 
                  They're sophisticated mechanisms for maintaining context, managing state, and enabling meaningful 
                  interactions between humans and AI assistants.
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
                    <span>Learn how threads enable stateful conversations in AI applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Understand the relationship between threads and context management in AI systems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Explore how thread management impacts AI response quality and consistency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Practice implementing thread-based conversations in your own AI projects</span>
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
