import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { applicationsAPI } from '../services/api.ts';
import { Application } from '../types/index.ts';
import { AnimatedPage } from '../components/layout/AnimatedPage.tsx';
import { Bot, Send, User, ChevronLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.ts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  score?: number | null;
  feedback?: string | null;
}

export const MockInterview: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const { data: appsData } = useQuery({
    queryKey: ['applicationsData'],
    queryFn: () => applicationsAPI.getAll(),
  });

  const apps: Application[] = appsData?.data || [];

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startInterview = async () => {
    if (!selectedAppId) return;
    setInterviewStarted(true);
    setIsLoading(true);
    
    try {
      const res = await api.post('/interviews/mock/chat', {
        applicationId: selectedAppId,
        chatHistory: []
      });
      
      if (res.data?.success) {
        setMessages([
          {
            role: 'assistant',
            content: res.data.data.message
          }
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages([{ role: 'assistant', content: 'Hi, I am your mock interviewer. Are you ready to begin?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedAppId) return;

    const userMessage = input.trim();
    setInput('');
    
    const newChatHistory: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage }
    ];
    
    setMessages(newChatHistory);
    setIsLoading(true);

    try {
      const res = await api.post('/interviews/mock/chat', {
        applicationId: selectedAppId,
        chatHistory: newChatHistory.map(m => ({ role: m.role, content: m.content }))
      });
      
      if (res.data?.success) {
        setMessages([
          ...newChatHistory,
          {
            role: 'assistant',
            content: res.data.data.message,
            score: res.data.data.score,
            feedback: res.data.data.feedback
          }
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages([
        ...newChatHistory,
        { role: 'assistant', content: 'Connection error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatedPage className="h-[calc(100vh-80px)] flex flex-col pb-6">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-brand-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Mock Interviewer</h1>
          <p className="text-xs text-slate-400">Practice your technical and behavioral skills with real-time feedback.</p>
        </div>
      </div>

      {!interviewStarted ? (
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto w-full mt-12 text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-white">Select a Job Role</h2>
            <p className="text-xs text-slate-400">Choose an application to start a targeted mock interview.</p>
          </div>
          
          <select 
            value={selectedAppId} 
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="select select-bordered w-full bg-neutral-900 border-white/10 text-white"
          >
            <option value="" disabled>Select an application...</option>
            {apps.map(app => (
              <option key={app._id} value={app._id}>
                {app.jobTitle} at {typeof app.companyId === 'object' ? (app.companyId as any).name : app.companyName}
              </option>
            ))}
          </select>

          <button 
            onClick={startInterview}
            disabled={!selectedAppId || isLoading}
            className="btn btn-primary w-full text-slate-950 font-bold"
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Start Interview Session'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-1 bg-neutral-900/40 border border-white/5 rounded-2xl overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="bg-neutral-950/80 p-4 border-b border-white/5 flex items-center justify-between z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 relative">
                <Bot className="w-4 h-4" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-neutral-950"></div>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Technical Recruiter AI</h3>
                <p className="text-[10px] text-green-400">Online • Ready</p>
              </div>
            </div>
            
            <button 
              onClick={() => { setInterviewStarted(false); setMessages([]); }}
              className="btn btn-xs btn-outline border-white/10 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-3 h-3" /> End Interview
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scroll">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700 text-white' : 'bg-brand-500/20 text-brand-400'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-[85%] md:max-w-[75%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-500 text-slate-950 rounded-tr-sm' 
                      : 'bg-neutral-800 text-slate-200 border border-white/5 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  
                  {msg.score && (
                    <div className="flex items-start gap-2 bg-neutral-950/60 p-3 rounded-xl border border-white/5">
                      <div className="bg-neutral-800 px-2 py-1 rounded text-xs font-bold text-brand-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brand-400" /> {msg.score}/10
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{msg.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-neutral-800 border border-white/5 rounded-2xl rounded-tl-sm p-4 w-16 flex justify-center items-center">
                  <span className="loading loading-dots loading-sm text-brand-500"></span>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-neutral-950/80 border-t border-white/5 backdrop-blur-md">
            <form onSubmit={handleSendMessage} className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isLoading}
                className="input w-full bg-neutral-900 border-white/10 text-white pl-4 pr-12 focus:outline-none focus:border-brand-500 rounded-xl"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 text-brand-400 hover:text-brand-300 disabled:text-slate-600 transition-colors rounded-lg hover:bg-white/5"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
          
        </div>
      )}

    </AnimatedPage>
  );
};

export default MockInterview;
