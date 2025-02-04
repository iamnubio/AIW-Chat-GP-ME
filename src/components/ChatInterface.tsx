import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Bot, Menu, X, ChevronRight, MessageSquare, Settings as SettingsIcon, HelpCircle, Home, Layers, Wrench, MessageCircle, UserSquare2 } from 'lucide-react';
import { useOpenAI } from '../context/OpenAIContext';
import MouseGlow from './effects/MouseGlow';

interface Message {
  content: string;
  role: 'assistant' | 'user';
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-zinc-800/80 rounded-tl-sm">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">AI Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span>Thinking</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatInterface() {
  const { state } = useOpenAI();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  const menuItems = [
    {
      type: 'section',
      title: 'Chat',
      items: [
        {
          icon: MessageSquare,
          label: 'Chat',
          path: '/chat',
          isActive: location.pathname === '/chat'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      title: 'Navigation',
      items: [
        {
          icon: Home,
          label: 'Dashboard',
          path: '/dashboard',
          isActive: location.pathname === '/dashboard'
        },
        {
          icon: Layers,
          label: 'Threads',
          path: '/threads',
          isActive: location.pathname === '/threads'
        },
        {
          icon: UserSquare2,
          label: 'Character Creator',
          path: '/character-creator',
          isActive: location.pathname === '/character-creator'
        },
        {
          icon: Wrench,
          label: 'Tools',
          path: '/tools',
          isActive: location.pathname === '/tools'
        },
        {
          icon: SettingsIcon,
          label: 'Settings',
          path: '/settings',
          isActive: location.pathname === '/settings'
        }
      ]
    },
    {
      type: 'section',
      title: 'Resources',
      items: [
        {
          icon: HelpCircle,
          label: 'Help',
          href: 'https://cookbook.openai.com',
          external: true
        },
        {
          icon: MessageCircle,
          label: 'Forum',
          href: 'https://community.openai.com/categories',
          external: true
        }
      ]
    }
  ];

  useEffect(() => {
    if (!state.selectedAssistant || !state.client) {
      navigate('/');
      return;
    }

    // Create a new thread when the component mounts
    const initializeThread = async () => {
      try {
        const thread = await state.client.beta.threads.create();
        setThreadId(thread.id);
      } catch (error) {
        console.error('Error creating thread:', error);
        navigate('/');
      }
    };

    initializeThread();
  }, [state.selectedAssistant, state.client, navigate]);

  // Send initial greeting
  useEffect(() => {
    if (threadId && state.client && state.selectedAssistant && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      setIsLoading(true);

      const sendGreeting = async () => {
        try {
          // Add the initial question to the thread
          await state.client.beta.threads.messages.create(threadId, {
            role: 'user',
            content: 'Who are you and what is your purpose?',
          });

          // Run the assistant
          const run = await state.client.beta.threads.runs.create(threadId, {
            assistant_id: state.selectedAssistant.id,
          });

          // Poll for the run completion
          const checkRunCompletion = async () => {
            const runStatus = await state.client.beta.threads.runs.retrieve(threadId, run.id);

            if (runStatus.status === 'completed') {
              // Get the assistant's response
              const messages = await state.client.beta.threads.messages.list(threadId);
              const lastMessage = messages.data[0]; // The most recent message

              if (lastMessage.role === 'assistant') {
                const content = lastMessage.content[0].type === 'text' 
                  ? lastMessage.content[0].text.value 
                  : 'I received your message but cannot display the response format.';

                setMessages(prev => [...prev, { content, role: 'assistant' }]);
              }
              setIsLoading(false);
            } else if (runStatus.status === 'failed') {
              throw new Error('Assistant run failed');
            } else {
              // Continue polling
              setTimeout(checkRunCompletion, 1000);
            }
          };

          await checkRunCompletion();
        } catch (error) {
          console.error('Error in greeting:', error);
          setIsLoading(false);
        }
      };

      sendGreeting();
    }
  }, [threadId, state.client, state.selectedAssistant]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !threadId || !state.client || !state.selectedAssistant) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, { content: userMessage, role: 'user' }]);

    try {
      // Add the message to the thread
      await state.client.beta.threads.messages.create(threadId, {
        role: 'user',
        content: userMessage,
      });

      // Run the assistant
      const run = await state.client.beta.threads.runs.create(threadId, {
        assistant_id: state.selectedAssistant.id,
      });

      // Poll for the run completion
      const checkRunCompletion = async () => {
        const runStatus = await state.client.beta.threads.runs.retrieve(threadId, run.id);

        if (runStatus.status === 'completed') {
          // Get the assistant's response
          const messages = await state.client.beta.threads.messages.list(threadId);
          const lastMessage = messages.data[0]; // The most recent message

          if (lastMessage.role === 'assistant') {
            const content = lastMessage.content[0].type === 'text' 
              ? lastMessage.content[0].text.value 
              : 'I received your message but cannot display the response format.';

            setMessages(prev => [...prev, { content, role: 'assistant' }]);
          }
          setIsLoading(false);
        } else if (runStatus.status === 'failed') {
          throw new Error('Assistant run failed');
        } else {
          // Continue polling
          setTimeout(checkRunCompletion, 1000);
        }
      };

      await checkRunCompletion();
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [
        ...prev,
        {
          content: "I apologize, but I'm having trouble processing your request. Please try again later.",
          role: 'assistant',
        },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950">
      <MouseGlow />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-b border-blue-900/50 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-semibold text-white">
                Chat GP-ME
              </h1>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-64 bg-gray-950/95 backdrop-blur-md transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } border-l border-blue-900/50 p-6 z-50`}
      >
        <button
          onClick={() => setIsMenuOpen(false)}
          className="absolute -left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <nav className="space-y-6">
          {menuItems.map((section, index) => (
            <div key={index}>
              {section.type === 'divider' ? (
                <div className="border-t border-blue-900/30 my-4" />
              ) : (
                <div className="space-y-3">
                  {section.title && (
                    <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider px-4">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item, itemIndex) => {
                      const ItemIcon = item.icon;
                      
                      if (item.external) {
                        return (
                          <a
                            key={itemIndex}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-blue-900/20 rounded-lg transition-colors"
                          >
                            <ItemIcon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </a>
                        );
                      }

                      return (
                        <button
                          key={itemIndex}
                          onClick={() => {
                            navigate(item.path);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center gap-2 px-4 py-2 w-full rounded-lg transition-colors ${
                            item.isActive
                              ? 'bg-blue-900/30 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-blue-900/20'
                          }`}
                        >
                          <ItemIcon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Chat Area */}
      <div className="pt-16 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gray-950/50 rounded-lg backdrop-blur-sm border border-blue-900/50 shadow-xl min-h-[calc(100vh-12rem)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              {isLoading && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-t border-blue-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-blue-900/50 text-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-blue-900 text-white rounded-lg px-4 py-2 transition-colors duration-200 flex items-center gap-2 ${
                isLoading 
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-800'
              }`}
              disabled={isLoading}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}