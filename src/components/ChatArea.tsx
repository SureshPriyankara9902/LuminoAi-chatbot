import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check } from 'lucide-react';
import { useStore } from '../store';
import { Message } from '../types';
import ReactMarkdown from 'react-markdown';

export const ChatArea: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { chats, currentChatId, settings, addMessage } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((chat) => chat.id === currentChatId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleCopy = async (text: string, messageId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId || isLoading) return;

    addMessage(currentChatId, 'user', input);
    const userMessage = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${settings.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: userMessage
              }]
            }],
            safetySettings: [{
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }],
            generationConfig: {
              temperature: settings.temperature,
              maxOutputTokens: settings.maxTokens,
              topP: 0.8,
              topK: 40
            }
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        addMessage(currentChatId, 'assistant', aiResponse);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('API Error:', error);
      addMessage(
        currentChatId,
        'assistant',
        'Sorry, I encountered an error processing your request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select or create a new chat to get started</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">{currentChat.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {currentChat.messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`relative group max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white shadow-md text-gray-800'
              }`}
            >
              <button
                onClick={() => handleCopy(message.content, message.id)}
                className={`absolute top-2 right-2 p-1 rounded ${
                  message.role === 'user'
                    ? 'hover:bg-blue-700 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                } opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                {copiedId === message.id ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};