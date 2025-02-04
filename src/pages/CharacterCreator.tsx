import React, { useState } from 'react';
import { Bot, Send, Plus, X, ChevronDown } from 'lucide-react';
import Layout from '../components/Layout';
import { useOpenAI } from '../context/OpenAIContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface MessageExample {
  user: string;
  character: string;
}

interface FormData {
  name: string;
  bio: string;
  lore: string;
  topics: string;
  styleAll: string;
  styleChat: string;
  stylePost: string;
  voiceModel: string;
  modelProvider: string;
}

export default function CharacterCreator() {
  const { state } = useOpenAI();
  const navigate = useNavigate();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!state.isConnected || !state.client) {
      toast.error('Please connect to OpenAI first');
      navigate('/');
    }
  }, [state.isConnected, state.client, navigate]);

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Character data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    bio: '',
    lore: '',
    topics: '',
    styleAll: '',
    styleChat: '',
    stylePost: '',
    voiceModel: '',
    modelProvider: ''
  });

  const [messageExamples, setMessageExamples] = useState<MessageExample[]>([{ user: '', character: '' }]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<string[]>(['']);
  const [adjectives, setAdjectives] = useState<string[]>(['']);
  const [activeTab, setActiveTab] = useState('basic');

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !state.client || !state.selectedAssistant) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Create a thread if none exists
      const thread = await state.client.beta.threads.create();

      // Add the message to the thread
      await state.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userMessage,
      });

      // Run the assistant
      const run = await state.client.beta.threads.runs.create(thread.id, {
        assistant_id: state.selectedAssistant.id,
      });

      // Poll for completion
      const checkRunCompletion = async () => {
        const runStatus = await state.client.beta.threads.runs.retrieve(thread.id, run.id);

        if (runStatus.status === 'completed') {
          // Get the assistant's response
          const messages = await state.client.beta.threads.messages.list(thread.id);
          const lastMessage = messages.data[0];

          if (lastMessage.role === 'assistant') {
            const content = lastMessage.content[0].type === 'text' 
              ? lastMessage.content[0].text.value 
              : 'I received your message but cannot display the response format.';

            setMessages(prev => [...prev, { role: 'assistant', content }]);

            // Update form data based on the message content
            // This is a simple example - you would want to implement more sophisticated parsing
            if (userMessage.toLowerCase().includes('name')) {
              const potentialName = userMessage.split('name')[1].trim();
              setFormData(prev => ({
                ...prev,
                name: potentialName
              }));
            }
          }
          setIsLoading(false);
        } else if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed');
        } else {
          setTimeout(checkRunCompletion, 1000);
        }
      };

      await checkRunCompletion();
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I'm having trouble processing your request. Please try again later."
        },
      ]);
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'personality', label: 'Personality' },
    { id: 'knowledge', label: 'Knowledge' },
    { id: 'examples', label: 'Examples' }
  ];

  return (
    <Layout>
      <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl">
        <div className="p-6 border-b border-blue-900/30">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">Character Creator</h1>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chat Interface */}
            <div className="bg-gray-900/40 rounded-lg p-6 border border-blue-900/30">
              <h2 className="text-xl font-semibold text-white mb-4">Character Creation Chat</h2>

              {messages.length === 0 && (
                <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-900/30">
                  <h3 className="font-semibold text-white mb-2">Let's create your AI character!</h3>
                  <p className="text-gray-400">
                    Tell me about the character you want to create. As we talk, I'll fill in their details in the form.
                  </p>
                </div>
              )}

              <div className="h-[400px] overflow-y-auto mb-4 space-y-4 pr-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        message.role === 'assistant'
                          ? 'bg-gray-900/80 rounded-tl-sm'
                          : 'bg-blue-900/20 rounded-tr-sm'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-400">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-white whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-900/80 rounded-tl-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Bot className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-400">AI Assistant</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>Thinking</span>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <textarea
                  className="flex-1 bg-gray-900/80 border border-blue-900/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Tell me about your character..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="bg-gray-900/40 rounded-lg p-6 border border-blue-900/30">
              <div className="flex space-x-2 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-900/30 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-blue-900/20'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {activeTab === 'basic' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Bio</label>
                      <textarea
                        className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Lore</label>
                      <textarea
                        className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={formData.lore}
                        onChange={(e) => setFormData({...formData, lore: e.target.value})}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'personality' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">General Style</label>
                      <textarea
                        className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={formData.styleAll}
                        onChange={(e) => setFormData({...formData, styleAll: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Chat Style</label>
                      <textarea
                        className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        value={formData.styleChat}
                        onChange={(e) => setFormData({...formData, styleChat: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Adjectives</label>
                      <div className="space-y-2">
                        {adjectives.map((adj, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={adj}
                              onChange={(e) => {
                                const newAdj = [...adjectives];
                                newAdj[index] = e.target.value;
                                setAdjectives(newAdj);
                              }}
                            />
                            <button
                              onClick={() => setAdjectives(adj => adj.filter((_, i) => i !== index))}
                              className="p-2 text-gray-400 hover:text-white hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setAdjectives([...adjectives, ''])}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50"
                        >
                          <Plus className="w-4 h-4" />
                          Add Adjective
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Knowledge Entries</label>
                      <div className="space-y-2">
                        {knowledgeEntries.map((entry, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              className="flex-1 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={entry}
                              onChange={(e) => {
                                const newEntries = [...knowledgeEntries];
                                newEntries[index] = e.target.value;
                                setKnowledgeEntries(newEntries);
                              }}
                            />
                            <button
                              onClick={() => setKnowledgeEntries(entries => entries.filter((_, i) => i !== index))}
                              className="p-2 text-gray-400 hover:text-white hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setKnowledgeEntries([...knowledgeEntries, ''])}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50"
                        >
                          <Plus className="w-4 h-4" />
                          Add Knowledge
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="space-y-4">
                    {messageExamples.map((example, index) => (
                      <div key={index} className="space-y-2 p-4 bg-gray-900/40 rounded-lg border border-blue-900/30">
                        <textarea
                          className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="User message..."
                          value={example.user}
                          onChange={(e) => {
                            const newExamples = [...messageExamples];
                            newExamples[index].user = e.target.value;
                            setMessageExamples(newExamples);
                          }}
                        />
                        <textarea
                          className="w-full px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Character response..."
                          value={example.character}
                          onChange={(e) => {
                            const newExamples = [...messageExamples];
                            newExamples[index].character = e.target.value;
                            setMessageExamples(newExamples);
                          }}
                        />
                        <button
                          onClick={() => setMessageExamples(examples => examples.filter((_, i) => i !== index))}
                          className="flex items-center gap-2 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors border border-red-900/50"
                        >
                          <X className="w-4 h-4" />
                          Remove Example
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setMessageExamples([...messageExamples, { user: '', character: '' }])}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50"
                    >
                      <Plus className="w-4 h-4" />
                      Add Example
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}