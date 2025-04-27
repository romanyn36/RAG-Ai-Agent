import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Message from '../../components/Message';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ChatPage.css";
import { Button, InputGroup, Form, Image } from "react-bootstrap";
import { BsChevronLeft, BsChevronRight, BsChatTextFill, BsPencilSquare, BsTrash, BsPaperclip, BsSend, BsSearch, BsMoon, BsSun } from "react-icons/bs";
import AlertModal from "../../components/AlertModal";
import apiClient from '../../AppClient';
import Loader from '../../components/Loader';

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

const ReasoningSteps = ({ steps }) => {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="reasoning-steps">
      <details>
        <summary>View reasoning process</summary>
        <div className="reasoning-steps-content">
          {steps && steps?.map((step, index) => (
            <div key={index} className="reasoning-step">
              <div className="reasoning-action">
                <strong>Action:</strong> {step.action.tool}
                {step.action.log && (
                  <div className="reasoning-thought">
                    <em>{step.action.log}</em>
                  </div>
                )}
                <div className="reasoning-input">
                  <code>{step.action.tool_input}</code>
                </div>
              </div>
              <div className="reasoning-observation">
                <strong>Result:</strong>
                <pre>{step.observation}</pre>
              </div>
            </div>
          ))}

        </div>
      </details>
    </div>
  );
};

const ChatPage = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "romani" });
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorChats, setErrorChats] = useState('');
  const [errorMessages, setErrorMessages] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage for dark mode preference
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  
  // Effect to apply dark mode to document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };
  
  const handleToggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  // chat 
  const [chats, setChats] = useState([]); 
  const [currentChat, setCurrentChat] = useState(); 
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [renameModal, setRenameModal] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const chatListRef = useRef(null); 
  const chatContentRef = useRef(null);
  const [waitingForReply, setWaitingForReply] = useState(false);
  const messagesEndRef = useRef(null); 

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setLoadingChats(true);
    apiClient.get('/chats/')
      .then(response => {
        const chats = response.data
        setChats(chats);
        if (chats.length > 0) setCurrentChat(chats[0].id);
      })
      .catch(error => {
        setErrorChats(error.message || error.response.data.detail || "Error loading chats");
      }
      );
    setLoadingChats(false);
  }, [userInfo, navigate]);

  useEffect(() => {
    if (currentChat && currentChat !== "newChat") {
      setLoadingMessages(true);
      setErrorMessages('');
      apiClient.get(`/chats/${currentChat}/messages/`)
        .then(response => {
          const messages = response.data;
          setMessages(messages);
        })
        .catch(error => {
          setErrorMessages(error.message || error.response?.data?.detail || "Error loading messages");
        })
        .finally(() => {
          setLoadingMessages(false);
        });
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

  const [agentMode, setAgentMode] = useState(true);

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
    formData.append("agent", agentMode); 

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
        }, 150);
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
    <div className={`modern-chat-app ${darkMode ? 'dark-mode' : ''}`}>
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
          <div className="search-container d-none">
            <InputGroup className="mb-3">
              <InputGroup.Text id="basic-addon1"><BsSearch /></InputGroup.Text>
              <Form.Control
                placeholder="Search chats..."
                aria-label="Search chats"
                aria-describedby="basic-addon1"
                className="search-input"
              />
            </InputGroup>
          </div>

          {/*list loading and error display */}
          <div className="chat-list-container">
            {loadingChats ? (
              <div className="loader-container">
                <Loader />
                <p className="text-center mt-2">Loading conversations...</p>
              </div>
            ) : errorChats ? (
              <div className="error-container">
                <Message variant="danger">{errorChats}</Message>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setErrorChats('');
                    setLoadingChats(true);
                    apiClient.get('/chats/')
                      .then(response => {
                        setChats(response.data);
                        if (response.data.length > 0) setCurrentChat(response.data[0].id);
                      })
                      .catch(error => {
                        setErrorChats(error.message || error.response?.data?.detail || "Error loading chats");
                      })
                      .finally(() => setLoadingChats(false));
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="chat-list" ref={chatListRef}>
                {chats?.length > 0 ? (
                  chats.map((chat) => (
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
                  ))
                ) : (
                  <p className="text-center">No chats available</p>
                )}
              </div>
            )}
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
          <div className="header-content">
            <div className="app-branding">
              <img src="/images/ai.png" alt="RAG AI-Agent" className="app-logo" />
              <h1 className="app-name">RAG AI-Agent</h1>
            </div>
            {currentChat && (
              <h2 className="current-chat-title">
                {chats.find(chat => chat.id === currentChat)?.name || "Chat"}
              </h2>
            )}
          </div>
          <button 
            className="dark-mode-toggle"
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <BsSun /> : <BsMoon />}
          </button>
        </div>

        <div className="chat-container" ref={chatContentRef}>
          {messages.length === 0 && !currentChat && (
            <div className="welcome-container">
              <div className="welcome-content">
                <h2>Welcome to RAG AI-Agent</h2>
                <p>Your intelligent document assistant powered by Retrieval-Augmented Generation</p>
                <div className="welcome-features">
                  <div className="feature-card">
                    <div className="feature-icon">📄</div>
                    <div className="feature-text">Upload documents for contextual answers</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🔍</div>
                    <div className="feature-text">Ask questions in natural language</div>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🤖</div>
                    <div className="feature-text">Toggle Agent mode for advanced reasoning</div>
                  </div>
                </div>
                <Button variant="primary" onClick={handleAddNewChat} className="welcome-btn">
                  + Start a New Conversation
                </Button>
              </div>
            </div>
          )}

          {messages.length === 0 && currentChat && (
            <div className="empty-chat-container">
              <div className="empty-chat-content">
                <h3>Start a new conversation</h3>
                <p>Upload a document or ask a question to get started</p>
                <div className="empty-chat-suggestions">
                  <div className="suggestion-pill" onClick={() => setInput("What is Th Current Time?")}>
                    What is Th Current Time?
                  </div>
                  <div className="suggestion-pill" onClick={() => setInput("what is the square root of 16?")}>
                    what is the square root of 16?
                  </div>
                  <div className="suggestion-pill" onClick={() => setInput("What do You Know about Egyptian Pyramids?")}>
                    What do You Know about Egyptian Pyramids?
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="messages-container">
            {loadingMessages ? (
              <div className="messages-loading-container">
                <Loader />
                <p className="text-center mt-2">Loading conversation...</p>
              </div>
            ) : errorMessages ? (
              <div className="messages-error-container">
                <Message variant="danger">{errorMessages}</Message>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mt-2 d-block mx-auto"
                  onClick={() => {
                    setErrorMessages('');
                    setLoadingMessages(true);
                    apiClient.get(`/chats/${currentChat}/messages/`)
                      .then(response => {
                        setMessages(response.data);
                      })
                      .catch(error => {
                        setErrorMessages(error.message || error.response?.data?.detail || "Error loading messages");
                      })
                      .finally(() => setLoadingMessages(true));
                  }}
                >
                  Retry Loading Messages
                </Button>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-messages-container">
                <p className="text-center text-muted">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-wrapper ${msg.type === "user" ? 'user-wrapper' : 'agent-wrapper'}`}
                >
                  <div className={`message-bubble ${msg.type === "user" ? 'user-message' : 'agent-message'}`}>
                    {/* Message content remains the same */}
                    {msg.type === "user" ? (
                      <div className="message-content user-content">
                        {msg.body}
                        <div className="user-icon"><Image src="/images/user.png" alt="User" /></div>
                      </div>
                    ) : (
                      <div className="message-content agent-content">
                        <div className="agent-icon"><Image src="/images/ai.png" alt="Agent" /></div>
                        <div className="agent-text">
                          <div dangerouslySetInnerHTML={{ __html: formatText(msg.body) }}></div>
                          {msg.reasoning_steps && (
                            <ReasoningSteps
                              steps={typeof msg.reasoning_steps === 'string'
                                ? JSON.parse(msg.reasoning_steps)
                                : msg.reasoning_steps}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {error && (
              <div className="general-error-container">
                <Message variant='danger'>
                  {error}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-2"
                    onClick={() => setError('')}
                  >
                    Dismiss
                  </Button>
                </Message>
              </div>
            )}

            {waitingForReply && <Responseloader />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {currentChat && (
          <div className="input-container">
            <div className="input-options">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="agentModeToggle"
                  checked={agentMode}
                  onChange={() => setAgentMode(!agentMode)}
                />
                <label className="form-check-label" htmlFor="agentModeToggle">
                  {agentMode ? 'Agent Mode' : 'Simple Mode'}
                </label>
              </div>
            </div>

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
