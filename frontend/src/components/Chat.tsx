import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, Sparkles, Brain, Zap, PlusCircle, Loader, Loader2 } from 'lucide-react';
import Appbar from './Appbar';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { FileNameAtom } from '../atoms';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const Chat = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileName = useRecoilValue(FileNameAtom)
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");
  const [createChatLoading, setCreateChatLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in.");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:9000/api/v1/user/authenticate",
          {},
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (res.data.LoggedIn) {
          setIsAuthenticated(true);
        } else {
          alert("You are not logged in");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuthentication();
  }, [navigate]);

  useEffect(() => {
    const payload = localStorage.getItem("token");
    const token = payload?.split(" ")[1];
    const decoded = jwtDecode(token!)
    setUserId(decoded.userId)
  }, [userId])

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-100">
        <Loader className="w-12 h-12 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; 
  }

  const createNewChat = async () => {
    try {
      if (currentChat && currentChat.messages.length === 0) {
        return;
      }
  
      const newChat: Chat = {
        id: crypto.randomUUID(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
      };
  
      const chat = await axios.post("http://localhost:9000/api/v1/chat/create", {
        title: newChat.title,
        userId
      });
  
      newChat.id = chat.data.id;
  
      setChats(prev => [newChat, ...prev]);
      setCurrentChat(newChat);
      setIsSidebarOpen(false);
    } catch (error) {
      alert("Failed to create a new chat");
      console.error("Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !currentChat) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    await axios.post('http://localhost:9000/api/v1/chat/message', {
      chatId: currentChat.id,
      content: userMessage.content
    })

    setInput('');

    const updatedChat: Chat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
    };

    setCurrentChat(updatedChat);

    // Only add to chats if this is the first message
    if (currentChat.messages.length === 0) {
      setChats(prev => prev.map(chat =>
        chat.id === currentChat.id ? updatedChat : chat
      ));
    }
    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/ask", {
        "question": userMessage.content,
        "fileName": fileName
      });

      const aiMessage: Message = {
        role: 'assistant',
        content: response.data.answer, 
        timestamp: new Date()
      };

      await axios.post('http://localhost:9000/api/v1/chat/message', {
        chatId: currentChat.id,
        content: aiMessage.content
      })
      
      const chatWithAiResponse: Chat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      };
      
      setCurrentChat(chatWithAiResponse);
      setChats(prev => prev.map(chat =>
        chat.id === currentChat.id ? chatWithAiResponse : chat
      ));
      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fileName) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center text-center bg-gray-100">
        <p className="text-lg font-medium text-gray-700">Please upload a dataset</p>
        <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition" onClick={() => navigate("/upload")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col">
      <Appbar />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Overlay for mobile when sidebar is open */}
        {/* {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setIsSidebarOpen(false)}
          />
        )} */}

        {/* Sidebar */}
        {/* <div
          className={`absolute md:relative inset-y-0 left-0 z-30 bg-slate-800 border-r border-slate-700 transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0'
            }`}
        >
          {isSidebarOpen && (
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div className="sticky top-0 z-10 bg-slate-800 pb-2">
                <button
                  onClick={async () => {
                    setCreateChatLoading(true);
                    await createNewChat();
                    setCreateChatLoading(false);
                  }}
                  disabled={createChatLoading}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors justify-center"
                >
                  {createChatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      New Chat
                    </>
                  )}
                </button>
              </div> */}
              {/* {chats.map(chat => (
                <button
                  key={chat.id}
                  onClick={() => {
                    setCurrentChat(chat);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentChat?.id === chat.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                    }`}
                >
                  <MessageCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate text-left">
                    {chat.messages[0]?.content.slice(0, 30) || 'New Chat'}
                  </span>
                </button>
              ))} */}
            {/* </div>
          )}
        </div> */}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <div className="flex-none p-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div> */}

          <main className="flex-1 container mx-auto px-4 py-8 flex flex-col overflow-hidden">
            <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
              {!currentChat && (
                <div className="flex-none">
                  <h1 className="text-4xl font-bold text-white text-center mb-4">
                    AI Assistant
                  </h1>
                  <p className="text-xl text-slate-300 text-center mb-8">
                    Chat with our AI assistant to get help with your questions
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 bg-slate-800 rounded-xl p-6 mb-4 shadow-lg overflow-y-auto min-h-0">
                <div className="space-y-4">
                  {!currentChat || currentChat.messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 w-full max-w-lg">
                        <div className="flex flex-col items-center p-6 bg-slate-700 rounded-lg">
                          <Bot className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-slate-200 text-sm">Advanced AI Assistant</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-slate-700 rounded-lg">
                          <Brain className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-slate-200 text-sm">Intelligent Responses</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-slate-700 rounded-lg">
                          <Sparkles className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-slate-200 text-sm">Natural Conversations</p>
                        </div>
                        <div className="flex flex-col items-center p-6 bg-slate-700 rounded-lg">
                          <Zap className="w-8 h-8 text-blue-400 mb-2" />
                          <p className="text-slate-200 text-sm">Fast & Accurate</p>
                        </div>
                      </div>
                      <p className="text-slate-400 max-w-md">
                        Start a conversation with our AI assistant. Ask questions, get help, or explore new ideas.
                      </p>
                      <button
                        onClick={async () => {
                          setCreateChatLoading(true);
                          await createNewChat();
                          setCreateChatLoading(false);
                        }}
                        disabled={createChatLoading}
                        className={`flex items-center gap-2 px-6 py-3 ${
                          createChatLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                        } text-white rounded-lg transition-colors ${currentChat == null ? "" : "invisible"}`}
                      >
                        {createChatLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-5 h-5" />
                            Start New Chat
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    currentChat.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-4 ${message.role === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : 'bg-slate-700 text-slate-200'
                            }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 text-slate-200 rounded-lg p-4">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="flex-none bg-slate-800 rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <MessageSquare className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={currentChat ? "Type your message here..." : "Create or select a chat to start"}
                    disabled={!currentChat}
                    className="flex-grow bg-slate-900 text-slate-200 rounded-lg px-4 py-3 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim() || !currentChat}
                    className={`p-3 rounded-lg flex items-center justify-center transition-colors ${isLoading || !input.trim() || !currentChat
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </main>

          {/* Footer */}
          <footer className="flex-none bg-slate-900 border-t border-slate-800 py-8">
            <div className="container mx-auto px-4 text-center text-slate-400">
              <p>© {new Date().getFullYear()} AnomalyX. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </div >
    </div >
  );
};

export default Chat;

