import React, { useState } from "react";
import { useWebSocket } from "../../kernels/context/WebSocketContext";

const ChatComponent = () => {
  const { messages, sendMessage } = useWebSocket();
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  return (
    <div>
      <h1>WebSocket Chat</h1>
      <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #ddd", padding: "10px" }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message"
        style={{ width: "70%", padding: "10px" }}
      />
      <button onClick={handleSend} style={{ padding: "10px 20px", marginLeft: "10px" }}>
        Send
      </button>
    </div>
  );
};

export default ChatComponent;