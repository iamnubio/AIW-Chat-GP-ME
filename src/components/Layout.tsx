import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bot, Menu, X, ChevronRight, MessageSquare, Settings as SettingsIcon, HelpCircle, Home, Layers, Wrench, MessageCircle, UserSquare2 } from 'lucide-react';
import MouseGlow from './effects/MouseGlow';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-blue-950 to-gray-950">
      <MouseGlow />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-950/90 backdrop-blur-md border-b border-blue-900/50 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-blue-400" />
              <h1 className="text-lg font-semibold text-white">BOOGIE-Ai</h1>
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

      {/* Main Content */}
      <div className="pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
