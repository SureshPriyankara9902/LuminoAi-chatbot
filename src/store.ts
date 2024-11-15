import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, Settings } from './types';

interface State {
  chats: Chat[];
  currentChatId: string | null;
  settings: Settings;
  addChat: () => void;
  setCurrentChat: (id: string) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, role: 'user' | 'assistant', content: string) => void;
  updateSettings: (settings: Partial<Settings>) => void;
  toggleFavorite: (chatId: string) => void;
  clearAllChats: () => void;
  exportChat: (chatId: string) => string;
  importChat: (chatData: string) => void;
  exportSettings: () => string;
  importSettings: (settingsData: string) => void;
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      chats: [],
      currentChatId: null,
      settings: {
        apiKey: 'AIzaSyCxvLWAehDJB6Dud3DkO1KN84XONJY3Jnw',
        temperature: 0.7,
        maxTokens: 1000,
        theme: 'light',
        fontSize: 'medium',
        enterToSend: true,
        autoScroll: true,
        language: 'english',
        model: 'gemini-1.5-flash-latest',
      },
      addChat: () => {
        set((state) => {
          const newChat: Chat = {
            id: crypto.randomUUID(),
            title: `New Chat`,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            favorite: false,
          };
          return {
            chats: [newChat, ...state.chats],
            currentChatId: newChat.id,
          };
        });
      },
      setCurrentChat: (id) => set({ currentChatId: id }),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          currentChatId: state.currentChatId === id ? null : state.currentChatId,
        })),
      addMessage: (chatId, role, content) => {
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: chat.messages.length === 0 ? content.slice(0, 30) + '...' : chat.title,
                  messages: [
                    ...chat.messages,
                    {
                      id: crypto.randomUUID(),
                      role,
                      content,
                      timestamp: Date.now(),
                    },
                  ],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        }));
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      toggleFavorite: (chatId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, favorite: !chat.favorite } : chat
          ),
        })),
      clearAllChats: () => set({ chats: [], currentChatId: null }),
      exportChat: (chatId) => {
        const state = useStore.getState();
        const chat = state.chats.find((c) => c.id === chatId);
        return chat ? JSON.stringify(chat) : '';
      },
      importChat: (chatData) => {
        try {
          const chat = JSON.parse(chatData) as Chat;
          set((state) => ({
            chats: [{ ...chat, id: crypto.randomUUID() }, ...state.chats],
          }));
        } catch (error) {
          console.error('Failed to import chat:', error);
        }
      },
      exportSettings: () => {
        const state = useStore.getState();
        return JSON.stringify(state.settings);
      },
      importSettings: (settingsData) => {
        try {
          const newSettings = JSON.parse(settingsData) as Settings;
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      },
    }),
    {
      name: 'gemini-chat-storage',
    }
  )
);
