import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/home.css";

// Placeholder conversation data
const conversations = [
  { id: 1, title: "Explain quantum computing", time: "2h ago" },
  { id: 2, title: "Write a React component", time: "Yesterday" },
  { id: 3, title: "Plan a trip to Japan", time: "2 days ago" },
  { id: 4, title: "Debug my Python code", time: "3 days ago" },
];

const Home = () => {
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // closed by default on mobile

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    // TODO: connect to backend chat API
    console.log("Sending message:", message);
    setMessage("");
  };

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="home-wrapper">
      {/* Mobile overlay — tapping outside closes sidebar */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`home-sidebar ${sidebarOpen ? "open" : "closed-desktop"}`}
      >
        <button className="sidebar-new-btn">
          <span>✦</span> New Chat
        </button>

        <p className="sidebar-history-label">Recent Chats</p>
        <ul className="sidebar-history-list">
          {conversations.map((c) => (
            <li key={c.id} className="sidebar-history-item">
              <span className="sidebar-history-icon">💬</span>
              <div>
                <p className="sidebar-history-title">{c.title}</p>
                <p className="sidebar-history-time">{c.time}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">U</div>
          <div>
            <p className="sidebar-user-name">User Name</p>
            <Link to="/login" className="sidebar-logout-link">
              Sign out
            </Link>
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
            <span className="topbar-model-badge">GPT-4o</span>
          </div>
        </header>

        {/* Chat area */}
        <div className="home-chat-area">
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
                { icon: "✍️",  text: "Draft an email or essay" },
                { icon: "🗺️", text: "Plan my next trip" },
              ].map((s, i) => (
                <button
                  key={i}
                  className="suggestion-card"
                  onClick={() => setMessage(s.text)}
                >
                  <span className="suggestion-icon">{s.icon}</span>
                  <span className="suggestion-text">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input bar */}
        <div className="home-input-bar">
          <form onSubmit={handleSend} className="home-input-form">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message GPT Clone..."
              className="home-text-input"
            />
            <button
              type="submit"
              className="home-send-btn"
              disabled={!message.trim()}
            >
              ➤
            </button>
          </form>
          <p className="home-disclaimer">
            Responses may be inaccurate. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
