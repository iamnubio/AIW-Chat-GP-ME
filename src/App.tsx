import React from 'react';
import { OpenAIProvider } from './context/OpenAIContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';
import Dashboard from './pages/Dashboard';
import Threads from './pages/Threads';
import Tools from './pages/Tools';
import Settings from './pages/Settings';
import CharacterCreator from './pages/CharacterCreator';
import { Toaster } from 'sonner';

function App() {
  return (
    <OpenAIProvider>
      <Toaster richColors position="top-center" />
      <Router>
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/threads" element={<Threads />} />
          <Route path="/character-creator" element={<CharacterCreator />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </OpenAIProvider>
  );
}

export default App;