import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage, getUsername, clearToken } from "../services/api";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const username = getUsername();

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);
    };

    return () => socket.close();
  }, []);

  async function handleSend() {
    if (!message.trim()) return;
    await sendMessage(message);
    setMessage("");
  }

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h1>Kafka Chat</h1>
        <div>
          <span className="username">{username}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          placeholder="Type a message…"
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
