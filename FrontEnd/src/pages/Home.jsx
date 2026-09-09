import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";
import api from "../api/axios";
import { initSocket, disconnectSocket } from "../api/socket";

const Home = () => {
  const navigate = useNavigate();

  // State
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [user] = useState(() => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  });

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);

  // Keep activeChatIdRef in sync for socket listener callbacks
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize socket connection
  useEffect(() => {
    const socket = initSocket();
    socketRef.current = socket;

    // Listen for AI responses
    const handleAiResponse = (data) => {
      setIsTyping(false);
      if (data.chat === activeChatIdRef.current) {
        setMessages((prev) => [
          ...prev,
          { role: "model", content: data.content, _id: Date.now() },
        ]);
      }
    };

    // Listen for AI errors
    const handleAiError = (data) => {
      setIsTyping(false);
      setErrorMessage(data.message || "An error occurred with the AI assistant.");
    };

    socket.on("ai-response", handleAiResponse);
    socket.on("ai-error", handleAiError);

    return () => {
      socket.off("ai-response", handleAiResponse);
      socket.off("ai-error", handleAiError);
    };
  }, []);

  // Fetch chats on mount
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoadingChats(true);
        const res = await api.get("/api/chat");
        if (res.data?.chats) {
          setChats(res.data.chats);
        }
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Failed to load chats:", err);
        }
      } finally {
        setLoadingChats(false);
      }
    };

    fetchChats();
  }, [navigate]);

  // Fetch messages when activeChatId changes
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      try {
        setErrorMessage("");
        const res = await api.get(`/api/chat/${activeChatId}/messages`);
        if (res.data?.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setErrorMessage("Could not load messages for this chat.");
      }
    };

    fetchMessages();
  }, [activeChatId]);

  // Start a new chat draft
  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
    setInputMessage("");
    setErrorMessage("");
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Select existing chat
  const handleSelectChat = (chatId) => {
    if (chatId === activeChatId) return;
    setActiveChatId(chatId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    const content = inputMessage.trim();
    if (!content || isTyping) return;

    setInputMessage("");
    setErrorMessage("");

    let currentChatId = activeChatId;

    try {
      // If no chat exists yet, create one first via POST /api/chat
      if (!currentChatId) {
        const title = content.length > 30 ? content.slice(0, 30) + "…" : content;
        const res = await api.post("/api/chat", { title });
        const newChat = res.data.chat;
        currentChatId = newChat._id;

        setChats((prev) => [newChat, ...prev]);
        setActiveChatId(newChat._id);
        activeChatIdRef.current = newChat._id;
      }

      // Optimistically append user message to UI
      setMessages((prev) => [
        ...prev,
        { role: "user", content, _id: Date.now() },
      ]);
      setIsTyping(true);

      // Emit message via Socket.IO
      const socket = socketRef.current || initSocket();
      socket.emit("ai-message", {
        chat: currentChatId,
        content,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setIsTyping(false);
      setErrorMessage(
        err?.response?.data?.message || "Failed to send message. Please try again."
      );
    }
  };

  // Sign out
  const handleSignOut = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  // Format timestamp helper
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diffHours = Math.round((now - date) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.round(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // User display name & avatar initial
  const displayName =
    user?.fullName?.firstName ||
    (typeof user?.fullName === "string" ? user.fullName : "") ||
    user?.email?.split("@")[0] ||
    "User";
  const userInitial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <div className="home-wrapper">
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`home-sidebar ${sidebarOpen ? "open" : "closed-desktop"}`}
      >
        <button className="sidebar-new-btn" onClick={handleNewChat}>
          <span>✦</span> New Chat
        </button>

        <p className="sidebar-history-label">Recent Chats</p>
        <ul className="sidebar-history-list">
          {loadingChats ? (
            <li className="sidebar-empty-state">Loading chats…</li>
          ) : chats.length === 0 ? (
            <li className="sidebar-empty-state">No conversations yet</li>
          ) : (
            chats.map((c) => (
              <li
                key={c._id}
                className={`sidebar-history-item ${
                  activeChatId === c._id ? "active" : ""
                }`}
                onClick={() => handleSelectChat(c._id)}
              >
                <span className="sidebar-history-icon">💬</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="sidebar-history-title">{c.title || "Untitled Chat"}</p>
                  <p className="sidebar-history-time">
                    {formatTime(c.lastActive || c.createdAt)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{userInitial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="sidebar-user-name" title={displayName}>
              {displayName}
            </p>
            <button
              onClick={handleSignOut}
              className="sidebar-logout-link"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="home-main">
        {/* Topbar */}
        <header className="home-topbar">
          <button
            className="topbar-toggle-btn"
            onClick={toggleSidebar}
            title="Toggle sidebar"
          >
            ☰
          </button>
          <span className="topbar-title">GPT Clone</span>
          <div>
            <span className="topbar-model-badge">gemini-2.5-flash</span>
          </div>
        </header>

        {/* Chat area */}
        <div
          className={`home-chat-area ${
            messages.length > 0 ? "has-messages" : ""
          }`}
        >
          {errorMessage && (
            <div className="home-chat-error">
              <span>⚠ {errorMessage}</span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="home-welcome">
              <div className="home-welcome-icon">✦</div>
              <h2 className="home-welcome-title">How can I help you today?</h2>
              <p className="home-welcome-sub">
                Ask me anything — code, essays, ideas, and more.
              </p>

              {/* Suggestion cards */}
              <div className="suggestions-grid">
                {[
                  { icon: "💡", text: "Explain a complex topic simply" },
                  { icon: "🧑‍💻", text: "Write or review my code" },
                  { icon: "✍️", text: "Draft an email or essay" },
                  { icon: "🗺️", text: "Plan my next trip" },
                ].map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-card"
                    onClick={() => setInputMessage(s.text)}
                  >
                    <span className="suggestion-icon">{s.icon}</span>
                    <span className="suggestion-text">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-messages-container">
              {messages.map((m, index) => (
                <div
                  key={m._id || index}
                  className={`message-row message-row--${m.role}`}
                >
                  <div className={`message-avatar message-avatar--${m.role}`}>
                    {m.role === "user" ? userInitial : "✦"}
                  </div>
                  <div className={`message-bubble message-bubble--${m.role}`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="message-row message-row--model">
                  <div className="message-avatar message-avatar--model">✦</div>
                  <div className="message-bubble message-bubble--model">
                    <div className="typing-dots">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="home-input-bar">
          <form onSubmit={handleSend} className="home-input-form">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Message GPT Clone..."
              className="home-text-input"
              disabled={isTyping}
            />
            <button
              type="submit"
              className="home-send-btn"
              disabled={!inputMessage.trim() || isTyping}
            >
              ➤
            </button>
          </form>
          <p className="home-disclaimer">
            Responses are generated with Google Gemini and dual-layer memory.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
