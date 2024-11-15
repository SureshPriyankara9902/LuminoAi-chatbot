import React, { useState } from 'react';
import { MessageSquarePlus, Settings as SettingsIcon, Plus, Search, Trash2, Star, Download } from 'lucide-react';
import { useStore } from '../store';
import { SettingsModal } from './Settings';
import { formatDistanceToNow } from 'date-fns';

export const Sidebar: React.FC = () => {
  const { chats, currentChatId, addChat, setCurrentChat, deleteChat, toggleFavorite, exportChat } = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredChats = chats
    .filter((chat) => 
      (filter === 'all' || (filter === 'favorites' && chat.favorite)) &&
      chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const handleExport = (chatId: string) => {
    const chatData = exportChat(chatId);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="w-80 h-screen bg-gray-900 text-white p-4 flex flex-col">
        <button
          onClick={addChat}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          New Chat
        </button>

        <div className="mt-4 space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg ${
                filter === 'all' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1 rounded-lg ${
                filter === 'favorites' ? 'bg-blue-600' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-sm font-semibold text-gray-400 mb-2">
            {filter === 'all' ? 'Recent Chats' : 'Favorite Chats'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`group px-2 py-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer ${
                currentChatId === chat.id ? 'bg-gray-800' : ''
              }`}
            >
              <div className="flex items-center gap-3" onClick={() => setCurrentChat(chat.id)}>
                <MessageSquarePlus size={18} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{chat.title}</div>
                  <div className="text-sm text-gray-400">
                    {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(chat.id);
                    }}
                    className={`p-1 rounded ${
                      chat.favorite ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'
                    }`}
                  >
                    <Star size={16} fill={chat.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(chat.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            <SettingsIcon size={18} />
            Settings
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};