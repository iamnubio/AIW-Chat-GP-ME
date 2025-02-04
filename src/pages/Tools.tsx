import React from 'react';
import { Wrench, Wand2, Database, Code2, Cpu, Bot, Terminal, Gauge } from 'lucide-react';
import Layout from '../components/Layout';
import { useOpenAI } from '../context/OpenAIContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Tools() {
  const { state } = useOpenAI();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!state.isConnected || !state.client) {
      toast.error('Please connect to OpenAI first');
      navigate('/');
    }
  }, [state.isConnected, state.client, navigate]);

  const features = [
    {
      icon: Terminal,
      title: "Development Tools",
      description: "Essential tools and utilities for building AI-powered applications efficiently."
    },
    {
      icon: Bot,
      title: "Testing Framework",
      description: "Tools for testing and validating AI responses and behavior patterns."
    },
    {
      icon: Gauge,
      title: "Performance Metrics",
      description: "Monitor and analyze AI assistant performance and response quality."
    },
    {
      icon: Code2,
      title: "Integration Tools",
      description: "Utilities for seamless integration with various development environments."
    }
  ];

  const tools = [
    {
      icon: Wand2,
      name: "Playground",
      description: "Test and experiment with different models and parameters",
      comingSoon: true
    },
    {
      icon: Database,
      name: "Fine-tuning",
      description: "Customize models for your specific use case",
      comingSoon: true
    },
    {
      icon: Code2,
      name: "API Testing",
      description: "Test API endpoints and responses",
      comingSoon: true
    },
    {
      icon: Cpu,
      name: "Model Analysis",
      description: "Analyze model performance and behavior",
      comingSoon: true
    }
  ];

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl">
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Tools</h1>
          </div>
        </div>
        
        <div className="p-8">
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Existing Content */}
            <div className="text-center space-y-6">
              <div className="p-4 bg-blue-900/20 rounded-lg inline-block mx-auto">
                <Wrench className="w-12 h-12 text-blue-400" />
              </div>
              
              <h2 className="text-xl font-semibold text-white">
                AI Development Tools
              </h2>
              
              <p className="text-gray-400">
                Explore our comprehensive suite of AI development tools designed to help you build,
                test, and optimize your AI applications.
              </p>
            </div>

            {/* Tool Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {tools.map((tool, index) => (
                <div 
                  key={index}
                  className="bg-gray-900/50 rounded-lg p-4 border border-blue-900/30 hover:bg-blue-900/10 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <tool.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
                  </div>
                  <p className="text-gray-400 mb-3">{tool.description}</p>
                  {tool.comingSoon && (
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-400 bg-blue-900/30 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Educational Content */}
            <div className="space-y-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">
                  AI Development Toolkit
                </h3>
                <p className="text-gray-400">
                  Understanding and utilizing the right development tools is crucial for building
                  effective AI applications. Learn about the essential tools and practices for
                  professional AI development.
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
                    <span>Master essential AI development tools and utilities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Learn effective testing strategies for AI applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Understand performance monitoring and optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2"></div>
                    <span>Explore advanced development techniques and best practices</span>
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