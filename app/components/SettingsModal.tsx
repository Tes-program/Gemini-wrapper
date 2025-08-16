// app/components/SettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, Save, RotateCcw } from 'lucide-react';
import { ChatSettings } from '../types/chat';

interface SettingsModalProps {
  settings: ChatSettings;
  onUpdateSettings: (settings: ChatSettings) => void;
  onClose: () => void;
}

const DEFAULT_SETTINGS: ChatSettings = {
  model: 'gemini-1.5-pro',
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.95,
  topK: 40,
  systemInstruction: '',
};

export default function SettingsModal({ settings, onUpdateSettings, onClose }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
  const [activeTab, setActiveTab] = useState<'parameters' | 'system'>('parameters');

  useEffect(() => {
    // Prevent scroll on body when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('parameters')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'parameters'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Generation Parameters
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'system'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            System Instruction
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {activeTab === 'parameters' ? (
            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="temperature" className="text-sm font-medium">
                    Temperature
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Controls randomness. Lower values make output more focused and deterministic, 
                      higher values make it more creative and diverse.
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-600">{localSettings.temperature}</span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localSettings.temperature}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    temperature: parseFloat(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Focused</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="maxTokens" className="text-sm font-medium">
                    Max Tokens
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Maximum number of tokens to generate. One token is roughly 4 characters.
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-600">{localSettings.maxTokens}</span>
                </div>
                <input
                  id="maxTokens"
                  type="range"
                  min="256"
                  max="8192"
                  step="256"
                  value={localSettings.maxTokens}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    maxTokens: parseInt(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>256</span>
                  <span>4096</span>
                  <span>8192</span>
                </div>
              </div>

              {/* Top P */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="topP" className="text-sm font-medium">
                    Top P (Nucleus Sampling)
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Controls diversity via nucleus sampling. 0.5 means half of all likelihood-weighted 
                      options are considered.
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-600">{localSettings.topP}</span>
                </div>
                <input
                  id="topP"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={localSettings.topP}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    topP: parseFloat(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>

              {/* Top K */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label htmlFor="topK" className="text-sm font-medium">
                    Top K
                  </label>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      Limits the number of tokens to consider for each step. Lower values make 
                      output more focused.
                    </div>
                  </div>
                  <span className="ml-auto text-sm text-gray-600">{localSettings.topK}</span>
                </div>
                <input
                  id="topK"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={localSettings.topK}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    topK: parseInt(e.target.value) 
                  }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              {/* Preset Templates */}
              <div>
                <h3 className="text-sm font-medium mb-3">Quick Presets</h3>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      temperature: 0.2,
                      topP: 0.8,
                      topK: 20,
                    }))}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    📊 Precise
                  </button>
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      temperature: 0.7,
                      topP: 0.95,
                      topK: 40,
                    }))}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ⚖️ Balanced
                  </button>
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      temperature: 1.5,
                      topP: 1.0,
                      topK: 100,
                    }))}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    🎨 Creative
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label htmlFor="systemInstruction" className="block text-sm font-medium mb-2">
                  System Instruction
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Provide instructions that will be applied to all messages in this chat. 
                  This helps set the behavior, tone, and context for the AI assistant.
                </p>
                <textarea
                  id="systemInstruction"
                  value={localSettings.systemInstruction || ''}
                  onChange={(e) => setLocalSettings(prev => ({ 
                    ...prev, 
                    systemInstruction: e.target.value 
                  }))}
                  placeholder="e.g., You are a helpful assistant that explains complex topics in simple terms..."
                  className="w-full h-48 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Example Templates */}
              <div>
                <h3 className="text-sm font-medium mb-2">Example Templates</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      systemInstruction: "You are a helpful coding assistant. Provide clear, concise code examples with explanations. Follow best practices and include error handling when appropriate."
                    }))}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">💻 Coding Assistant</span>
                    <p className="text-xs text-gray-500 mt-1">Focused on programming help</p>
                  </button>
                  
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      systemInstruction: "You are a creative writing assistant. Help with storytelling, character development, and narrative structure. Be imaginative and engaging."
                    }))}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">✍️ Creative Writer</span>
                    <p className="text-xs text-gray-500 mt-1">For creative writing tasks</p>
                  </button>
                  
                  <button
                    onClick={() => setLocalSettings(prev => ({
                      ...prev,
                      systemInstruction: "You are a professional business consultant. Provide strategic advice, analyze problems systematically, and offer actionable recommendations."
                    }))}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium">💼 Business Consultant</span>
                    <p className="text-xs text-gray-500 mt-1">Professional business advice</p>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}