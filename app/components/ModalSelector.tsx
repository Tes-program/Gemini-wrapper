// app/components/ModelSelector.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Zap, Eye, Brain } from 'lucide-react';
import { AVAILABLE_MODELS } from '@/lib/gemini';

interface ModelSelectorProps {
  selectedModel: string;
  onSelectModel: (model: string) => void;
}

const modelIcons: Record<string, React.ReactNode> = {
  'gemini-1.5-pro': <Brain className="w-4 h-4" />,
  'gemini-1.5-flash': <Zap className="w-4 h-4" />,
  'gemini-2.5-flash': <Sparkles className="w-4 h-4" />,
  'gemini-2.5-pro': <Eye className="w-4 h-4" />,
};

export default function ModelSelector({ selectedModel, onSelectModel }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Select model"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {modelIcons[currentModel.id]}
          <span className="font-medium text-sm">{currentModel.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2">
            {AVAILABLE_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onSelectModel(model.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                  selectedModel === model.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="mt-0.5">{modelIcons[model.id]}</div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{model.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}