import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Plus, X, ChevronDown, Loader2, Download } from 'lucide-react';
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

  const formDataRef = useRef<FormData>({
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

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageExamples, setMessageExamples] = useState<MessageExample[]>([{ user: '', character: '' }]);
  const [knowledgeEntries, setKnowledgeEntries] = useState<string[]>(['']);
  const [adjectives, setAdjectives] = useState<string[]>(['']);
  const [activeTab, setActiveTab] = useState('basic');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (!state.isConnected || !state.client) {
      toast.error('Please connect to OpenAI first');
      navigate('/');
    }
  }, [state.isConnected, state.client, navigate]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !state.client || !state.selectedAssistant) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const thread = await state.client.beta.threads.create();

      await state.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: userMessage,
      });

      await state.client.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: "Based on the character description I provided, please fill out the following fields: Name, Bio, Lore, Topics of Expertise, General Style, Chat Style. Provide the information in a structured format with clear labels for each field.",
      });

      const run = await state.client.beta.threads.runs.create(thread.id, {
        assistant_id: state.selectedAssistant.id,
      });

      const checkRunCompletion = async () => {
        const runStatus = await state.client.beta.threads.runs.retrieve(thread.id, run.id);

        if (runStatus.status === 'completed') {
          const messages = await state.client.beta.threads.messages.list(thread.id);
          const lastMessage = messages.data[0];

          if (lastMessage.role === 'assistant') {
            const content = lastMessage.content[0].type === 'text' 
              ? lastMessage.content[0].text.value 
              : 'I received your message but cannot display the response format.';

            console.log("AI Response:", content);

            setMessages(prev => [...prev, { role: 'assistant', content }]);

            const parsedResponse = parseAIResponse(content);
            console.log("Parsed Response:", parsedResponse);

            formDataRef.current = {
              ...formDataRef.current,
              ...parsedResponse
            };
            console.log("Updated Form Data:", formDataRef.current);
            forceUpdate({});
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

  const parseAIResponse = (content: string): Partial<FormData> => {
    const parsedData: Partial<FormData> = {};
    const fields = ['Name', 'Bio', 'Lore', 'Topics of Expertise', 'General Style', 'Chat Style'];
    
    fields.forEach(field => {
      const regex = new RegExp(`${field}:\\s*(.+?)(?=\\n\\n|$)`, 's');
      const match = content.match(regex);
      if (match) {
        const value = match[1].trim();
        switch (field) {
          case 'Name':
            parsedData.name = value.replace(/\*\*/g, '').trim();
            break;
          case 'Bio':
            parsedData.bio = value;
            break;
          case 'Lore':
            parsedData.lore = value;
            break;
          case 'Topics of Expertise':
            parsedData.topics = value;
            break;
          case 'General Style':
            parsedData.styleAll = value;
            break;
          case 'Chat Style':
            parsedData.styleChat = value;
            break;
        }
      }
    });
    
    return parsedData;
  };

  const generateCharacterFile = () => {
    const formData = formDataRef.current;
    return JSON.stringify({
      name: formData.name.replace(/\*\*/g, '').trim(),
      modelProvider: '',
      plugins: [],
      bio: formData.bio.split('\n').filter(line => line.trim()).map(line => 
        line.replace(/\*\*/g, '').trim()
      ),
      lore: formData.lore.split('\n').filter(line => line.trim()).map(line => 
        line.replace(/\*\*/g, '').trim()
      ),
      topics: formData.topics.split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^[-•]\s*/, '').trim()),
      style: {
        all: formData.styleAll.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/\*\*/g, '').trim()),
        chat: formData.styleChat.split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/\*\*/g, '').trim()),
        post: []
      },
      messageExamples: messageExamples,
      postExamples: [],
      adjectives: adjectives.filter(adj => adj.trim() !== ''),
      people: [],
      knowledge: knowledgeEntries.filter(entry => entry.trim() !== ''),
    }, null, 2);
  };

  const downloadCharacterFile = () => {
    const content = generateCharacterFile();
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formDataRef.current.name || 'character'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-400" />
              <h1 className="text-2xl font-bold text-white">Character Creator</h1>
            </div>
            <button
              onClick={downloadCharacterFile}
              className="px-4 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-white rounded-lg transition-colors border border-blue-900/50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Character File
            </button>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <div className="bg-gray-900/40 rounded-lg p-6 border border-blue-900/30">
            <h2 className="text-xl font-semibold text-white mb-4">Character Creation Chat</h2>
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
              <input
                type="text"
                className="flex-1 bg-gray-900/80 border border-blue-900/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your character..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                      value={formDataRef.current.name}
                      onChange={(e) => {
                        formDataRef.current.name = e.target.value;
                        forceUpdate({});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Bio</label>
                    <textarea
                      className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={formDataRef.current.bio}
                      onChange={(e) => {
                        formDataRef.current.bio = e.target.value;
                        forceUpdate({});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Lore</label>
                    <textarea
                      className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={formDataRef.current.lore}
                      onChange={(e) => {
                        formDataRef.current.lore = e.target.value;
                        forceUpdate({});
                      }}
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
                      value={formDataRef.current.styleAll}
                      onChange={(e) => {
                        formDataRef.current.styleAll = e.target.value;
                        forceUpdate({});
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-1">Chat Style</label>
                    <textarea
                      className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={formDataRef.current.styleChat}
                      onChange={(e) => {
                        formDataRef.current.styleChat = e.target.value;
                        forceUpdate({});
                      }}
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
                    <label className="block text-sm font-medium text-gray-200 mb-1">Topics of Expertise</label>
                    <textarea
                      className="w-full h-32 px-4 py-2 bg-gray-900/80 border border-blue-900/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      value={formDataRef.current.topics}
                      onChange={(e) => {
                        formDataRef.current.topics = e.target.value;
                        forceUpdate({});
                      }}
                    />
                  </div>
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
                        Add Knowledge Entry
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

        {/* Full JSON Character File */}
        <div className="mt-8 p-4 bg-gray-900/40 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Full JSON Character File</h3>
          <pre className="text-xs text-gray-400 overflow-auto max-h-96 whitespace-pre-wrap">
            {generateCharacterFile()}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
