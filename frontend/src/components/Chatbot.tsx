import React, { useState, useEffect } from 'react';
import { chat, workspaces } from '../api';

interface Workspace {
  id: number;
  name: string;
}

interface ChatbotProps {
  workspaceId: number | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ workspaceId: initialWorkspaceId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspaceList, setWorkspaceList] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<number | null>(initialWorkspaceId);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadHistory();
    } else {
      setMessages([]);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      const response = await workspaces.getAll();
      setWorkspaceList(response.data);
      if (response.data.length > 0 && !selectedWorkspace) {
        setSelectedWorkspace(response.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load workspaces', err);
    }
  };

  const loadHistory = async () => {
    if (!selectedWorkspace) return;
    try {
      const response = await chat.getHistory(selectedWorkspace);
      setMessages(response.data);
    } catch (err) {
      console.error('Failed to load chat history', err);
    }
  };

  const clearChat = async () => {
    if (!selectedWorkspace) return;
    
    const confirmed = window.confirm('Are you sure you want to clear all chat history for this workspace? This cannot be undone.');
    if (!confirmed) return;
    
    try {
      await chat.clearHistory(selectedWorkspace);
      setMessages([]);
      alert('Chat history cleared successfully!');
    } catch (err) {
      console.error('Failed to clear chat history', err);
      alert('Failed to clear chat history. Please try again.');
    }
  };

  const formatResponse = (text: string) => {
    // Remove or convert markdown formatting
    return text
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold + Italic
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.+?)\*/g, '<em>$1</em>') // Italic
      .replace(/\n/g, '<br/>'); // Line breaks
  };

  const sendMessage = async () => {
    if (!input || !selectedWorkspace) return;
    setLoading(true);
    try {
      const response = await chat.send(selectedWorkspace, input);
      setMessages([...messages, { message: input, response: response.data.response }]);
      setInput('');
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message. Make sure you have papers in this workspace.');
    }
    setLoading(false);
  };

  const getWorkspaceName = () => {
    const workspace = workspaceList.find(ws => ws.id === selectedWorkspace);
    return workspace ? workspace.name : 'Select Workspace';
  };

  if (workspaceList.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-blue-900 mb-2">No Workspaces Found</h3>
          <p className="text-blue-700 mb-4">Create a workspace first to start chatting with AI!</p>
          <p className="text-sm text-blue-600">Go to Workspaces tab → Create a new workspace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-screen">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">AI Research Assistant</h2>
          {selectedWorkspace && messages.length > 0 && (
            <button
              onClick={clearChat}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-medium text-sm"
            >
              Clear Chat
            </button>
          )}
        </div>
        
        {/* Workspace Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Workspace:
          </label>
          <select
            value={selectedWorkspace || ''}
            onChange={(e) => setSelectedWorkspace(Number(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {workspaceList.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Chatting in: <span className="font-medium text-blue-600">{getWorkspaceName()}</span>
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-gray-50 p-4 rounded-lg">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No messages yet. Start a conversation!</p>
            <p className="text-sm">Make sure you have imported papers to this workspace first.</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx}>
              <div className="bg-blue-100 p-3 rounded-lg mb-2">
                <p className="font-bold text-blue-900">You:</p>
                <p className="text-gray-800">{msg.message}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="font-bold text-green-700">AI Assistant:</p>
                <div 
                  className="text-gray-800 whitespace-pre-wrap prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatResponse(msg.response) }}
                />
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Ask about your research papers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          disabled={loading || !selectedWorkspace}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-400"
          disabled={loading || !input || !selectedWorkspace}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
      
      {!selectedWorkspace && (
        <p className="text-sm text-red-600 mt-2">Please select a workspace to start chatting</p>
      )}
    </div>
  );
};

export default Chatbot;
