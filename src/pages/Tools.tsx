import React from 'react';
import { Wrench, Wand2, Database, Code2, Cpu } from 'lucide-react';
import Layout from '../components/Layout';

export default function Tools() {
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
        
        <div className="p-6">
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
        </div>
      </div>
    </Layout>
  );
}