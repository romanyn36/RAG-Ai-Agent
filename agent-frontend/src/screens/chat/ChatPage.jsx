import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../../components/Message';
// chat 
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ChatPage.css";
import { Button, InputGroup, Form, Image } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight, BsChatTextFill, BsPencilSquare, BsTrash, BsPaperclip, BsSend } from "react-icons/bs";
import AlertModal from "../../components/AlertModal";
import apiClient from '../../AppClient';

const Responseloader = () => {
  return (
    <div className="response-loader" role="status">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p>Generating response</p>
    </div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [modeltype, setModelType] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "romani" });
  const [loading, setLoading] = useState(false);
  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  // chat 
  const [chats, setChats] = useState([]); // Using mock data
  const [currentChat, setCurrentChat] = useState(); // Start with a default chat
  const [messages, setMessages] = useState([]); // Using mock messages
  const [input, setInput] = useState("");
  const [renameModal, setRenameModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const chatListRef = useRef(null); // Ref for the chat list
  const chatContentRef = useRef(null);
  const [waitingForReply, setWaitingForReply] = useState(false);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userInfo) {
      // navigate('/login?redirect=/dashboard');
    }
  }, [userInfo, navigate]);

  useEffect(() => {
    apiClient.get('/chats/')
      .then(response => {
        const chats = response.data
        setChats(chats);
        console.log("chats", chats)
        if (chats.length > 0) setCurrentChat(chats[0].id);
      })
      .catch(error => console.log(error));
  }, [userInfo, navigate]);

  useEffect(() => {
    // When changing chats, load the corresponding messages
    // chats/1/messages/
    if (currentChat) {
      apiClient.get(`/chats/${currentChat}/messages/`)
        .then(response => {
          const messages = response.data;
          setMessages(messages);
          console.log("messages", messages)
        })
        .catch(error => console.log(error));
    }


  }, [currentChat]);

  const handleRetry = () => {
    setWaitingForReply(false); // Reset waiting for reply
    handleAddNewChat(); // Retry creating a new chat
  };

  const handleRenameChat = () => {
    // rename chat in laoded chats
    setChats(prevChats =>
      prevChats.map(chat => chat.id === currentChat ? { ...chat, name: newChatName } : chat)
    );
    setRenameModal(false);
    // api call to rename chat
    apiClient.put(`/chats/${currentChat}/rename/`, { name: newChatName })
      .then(response => {
        const updatedChat = response.data;
        setChats(prevChats =>
          prevChats.map(chat => chat.id === updatedChat.id ? updatedChat : chat)
        );
        toast.success("Chat renamed successfully!");
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Error renaming chat: " + error.message);
        }
        console.error("Error renaming chat", error);
      });
  };

  const handleSend = () => {
    if (!input.trim() && !selectedFile) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: "user",
      body: selectedFile ? `${input || ""}${input ? " (with file: " + selectedFile.name + ")" : "File: " + selectedFile.name}` : input
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setWaitingForReply(true);

    // Create FormData to handle both text and files
    const formData = new FormData();
    if (selectedFile) {
      formData.append("files", selectedFile);
    }
    formData.append("query", input);
    formData.append("agent", true);

    // Send message to the server using the combined endpoint
    apiClient.post(`/chats/${currentChat}/send/`, formData)
      .then(response => {
        const agentMessage = response.data.agent_response;
        setTimeout(() => {
          setWaitingForReply(false);
          setMessages(prevMessages => [...prevMessages, agentMessage]);
          if (currentChat === "newChat") {
            setCurrentChat(response.data.chat_id);
            setChats(prevChats => [...prevChats, { id: response.data.chat_id, name: response.data.chat_name }]);
          }
        }, 1000);
      })
      .catch(error => {
        setWaitingForReply(false);
        if (error.response && error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Error sending message: " + (error.message || "Unknown error"));
        }
        console.error("Error sending message", error);
      })
      .finally(() => {
        setSelectedFile(null); // Clear the file selection after sending
      });
  };

  const handleDeleteChat = (chatId) => {
    apiClient.delete(`/chats/${chatId}/delete/`)
      .then(() => {
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        if (currentChat === chatId) {
          setCurrentChat(null);
          setMessages([]);
        }
        toast.success("Chat deleted successfully!");
      })
      .catch(error => {
        if (error.response && error.response.data && error.response.data.detail) {
          setError(error.response.data.detail);
        } else {
          setError("Error deleting chat: " + error.message);
        }
        console.error("Error deleting chat", error);
      });

  }

  const handleChatClick = (chatId) => {
    setCurrentChat(chatId);
    // Messages will be updated via the useEffect
  };

  const [error, setError] = useState("");
  const handleAddNewChat = () => {
    setCurrentChat("newChat");
    setError("");
    setWaitingForReply(false);
    setInput("");
    setSelectedFile(null);
    setNewChatName("");
    setMessages([]);

  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    console.log(selectedFile);
  };

  function formatText(text) {
    if (!text) return "";
    const formattedText = text
      .replace(/(?:\r\n|\r|\n)/g, "<br>")
      .replace(/(?:\t)/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
      // replace ** with <strong>
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    return formattedText;
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="modern-chat-app">
      {/* Sidebar */}
      <nav
        id="sidebar"
        className={`sidebar-container ${collapsed ? 'collapsed' : ''} ${!userInfo ? 'd-none' : ''}`}
      >
        <div className="sidebar-header">
          <h3>{collapsed ? 'Chats' : 'My Conversations'}</h3>
          <button
            className="toggle-btn d-block d-md-none"
            onClick={handleToggleSidebar}
          >
            {collapsed ? <BsChevronRight /> : <BsChevronLeft />}
          </button>
        </div>

        <div className="sidebar-content">
          <Button
            variant="primary"
            className="new-chat-btn"
            onClick={handleAddNewChat}
          >
            + New Chat
          </Button>

          <div className="chat-list" ref={chatListRef}>
            {chats?.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${currentChat === chat.id ? 'active' : ''}`}
                onClick={() => handleChatClick(chat.id)}
              >
                <div className="chat-item-content">
                  <BsChatTextFill className='chat-icon' />
                  <span className='chat-name'>{chat.name}</span>
                </div>
                <div className="chat-actions">
                  {/* Rename Chat Modal */}
                  <AlertModal
                    show={renameModal}
                    customebutton={<Button
                      variant="link"
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setNewChatName(chat.name);
                        setRenameModal(true);
                      }}
                    >
                      <BsPencilSquare />
                    </Button>}
                    onHide={() => setRenameModal(false)}
                    myaction={handleRenameChat}
                    title="Rename Chat"
                    message={<Form.Control type="text" value={newChatName} onChange={(e) => setNewChatName(e.target.value)} />}
                    savetitle="Rename"
                    variant="primary"
                  />


                  <AlertModal
                    customebutton={
                      <Button
                        variant="link"
                        className="action-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BsTrash />
                      </Button>
                    }
                    myaction={() => handleDeleteChat(chat.id)}
                    title="Delete Chat"
                    message="Are you sure you want to delete this chat?"
                    savetitle="Delete Chat"
                    variant="danger"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}

      <div className="content-container">
        <div className="content-header">

          <button
            className="sidebar-toggle"
            onClick={handleToggleSidebar}
          >
            {collapsed ? <BsChevronRight /> : <BsChevronLeft />}
          </button>
          {currentChat && (
            <h2 className="current-chat-title">
              {chats.find(chat => chat.id === currentChat)?.name || "Chat"}
            </h2>
          )}
        </div>

        <div className="chat-container" ref={chatContentRef}>
          {messages.length === 0 && !currentChat && (
            <div className="welcome-container">
              <div className="welcome-content">
                <h2>Welcome to DocSemantic Generator</h2>
                <p>Start by creating a new conversation</p>
                <Button variant="primary" onClick={handleAddNewChat} className="welcome-btn">
                  + New Chat
                </Button>
              </div>
            </div>
          )}

          {messages.length === 0 && currentChat && (
            <div className="welcome-container">
              <div className="welcome-content">
                <h3>Start a new conversation</h3>
                <p>Enter your query below to begin</p>
              </div>
            </div>
          )}

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-wrapper ${msg.type === "user" ? 'user-wrapper' : 'agent-wrapper'}`}
              >
                <div className={`message-bubble ${msg.type === "user" ? 'user-message' : 'agent-message'}`}>
                  {msg.type === "user" ? (
                    <div className="message-content user-content">
                      {msg.body}
                      <div className="user-icon"><Image src="/images/user.png" alt="User" /></div>
                      
                    </div>
                  ) : (
                    <div className="message-content agent-content">
                      <div className="agent-icon"><Image src="/images/ai.png" alt="Agent" /></div>
                      <div className="agent-text" dangerouslySetInnerHTML={{ __html: formatText(msg.body) }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {error && <Message variant='danger'>{error}</Message>}
            {waitingForReply && <Responseloader />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {currentChat && (
          <div className="input-container">
            {selectedFile && (
              <div className="selected-file">
                <span title={selectedFile.name}>{selectedFile.name}</span>
                <Button
                  variant="link"
                  className="remove-file"
                  onClick={() => setSelectedFile(null)}
                >
                  &times;
                </Button>
              </div>
            )}
            <div className="message-input-group">
              <Form.Control
                as="textarea"
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="message-input"
              />
              <div className="input-actions">
                <label className="file-input-label">
                  <BsPaperclip />
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept=".txt,.pdf,.docx"
                  />
                </label>
                <Button
                  variant="primary"
                  className="send-button"
                  onClick={handleSend}
                  disabled={!input.trim() && !selectedFile}
                >
                  <BsSend />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
