import React, { useState } from 'react';
import { Plus, X, Trash2, MessageSquare } from 'lucide-react';
import Button from './Button';

const ChatSidebar = ({ 
  conversations = [], 
  currentConversationId,
  isOpen, 
  onToggle,
  onConversationSelect,
  onNewConversation,
  onDeleteConversation,
  className = '' 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTruncatedTitle = (conversation) => {
    if (conversation.title) return conversation.title;
    
    // Generate title from first message
    const firstUserMessage = conversation.messages?.find(msg => msg.sender === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.text || '';
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    
    return 'New Conversation';
  };

  const handleDeleteClick = (e, conversationId) => {
    e.stopPropagation();
    setShowDeleteConfirm(conversationId);
  };

  const confirmDelete = (conversationId) => {
    onDeleteConversation?.(conversationId);
    setShowDeleteConfirm(null);
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conversation) => {
    const dateKey = formatDate(conversation.timestamp);
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(conversation);
    return groups;
  }, {});

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full w-80 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:z-auto
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={onNewConversation}
              variant="ghost"
              size="small"
              className="text-white hover:bg-gray-700 p-2"
              title="New Conversation"
            >
              <Plus size={16} />
            </Button>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="small"
              className="text-white hover:bg-gray-700 p-2 lg:hidden"
              title="Close Sidebar"
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* New Conversation Button */}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {Object.keys(groupedConversations).length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="mb-4 flex justify-center">
                <MessageSquare size={48} />
              </div>
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start chatting to see your history here</p>
            </div>
          ) : (
            Object.entries(groupedConversations).map(([dateKey, convos]) => (
              <div key={dateKey} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {dateKey}
                </h3>
                <div className="space-y-2">
                  {convos.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`
                        group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                        ${currentConversationId === conversation.id 
                          ? 'bg-gray-700 border-l-4 border-blue-400' 
                          : 'hover:bg-gray-800'
                        }
                      `}
                      onClick={() => onConversationSelect?.(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-white truncate">
                            {getTruncatedTitle(conversation)}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {conversation.messages?.length || 0} messages
                          </p>
                        </div>
                        
                        {/* Delete button */}
                        <Button
                          onClick={(e) => handleDeleteClick(e, conversation.id)}
                          variant="ghost"
                          size="small"
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 p-1 ml-2 transition-opacity"
                          title="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>

                      {/* Message preview */}
                      {conversation.messages && conversation.messages.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {conversation.messages[conversation.messages.length - 1]?.text?.substring(0, 50) + '...'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-700 p-4">
          <div className="text-xs text-gray-400">
            AI Bootcamp Tutor MVP
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Conversation?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. The conversation and all its messages will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="ghost"
                className="text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatSidebar;