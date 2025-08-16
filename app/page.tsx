// app/page.tsx
'use client';

import React, { useState, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { Chat, Message, ChatSettings } from './types/chat';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function Home() {
  const [chats, setChats, isClient] = useLocalStorage<Chat[]>('gemini-chats', []);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentChat = chats.find(c => c.id === currentChatId);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      model: 'gemini-1.5-pro',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newChat.id);
    setSidebarOpen(false);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages,
            title: messages[0]?.content.slice(0, 30) || 'New Chat',
            updatedAt: new Date()
          }
        : chat
    ));
  };

  const sendMessage = async (content: string, settings: ChatSettings) => {
    if (!currentChatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    const updatedMessages = [...(currentChat?.messages || []), userMessage];
    updateChatMessages(currentChatId, updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          settings
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantMessage += parsed.text;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      };

      updateChatMessages(currentChatId, [...updatedMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={setCurrentChatId}
        onNewChat={createNewChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <main className="flex-1 flex flex-col">
        {currentChat ? (
          <ChatInterface
            chatId={currentChat.id}
            messages={currentChat.messages}
            onSendMessage={sendMessage}
            onUpdateMessages={(messages) => updateChatMessages(currentChat.id, messages)}
            isLoading={isLoading}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Welcome to Gemini Wrapper</h1>
              <p className="text-gray-600 mb-6">Start a conversation with Google&apos;s Gemini AI</p>
              <button
                onClick={createNewChat}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}