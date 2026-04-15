// Example Component
import React, { useCallback } from 'react';
import { useSSE } from './hooks/useSSE';

const NotificationDashboard = () => {
  const [userId] = useState('123');   // Replace with your real userId (from auth/context)

  // Optional: handle each message immediately
  const handleNewMessage = useCallback((data: any) => {
    console.log('New notification received:', data);
    // You can show toast here, update badge, etc.
  }, []);

  const { messages, isConnected, error, reconnect } = useSSE({
    userId,
    onMessage: handleNewMessage,
  });

  return (
    <div>
      <h1>Live Notifications</h1>
      
      <div style={{ color: isConnected ? 'green' : 'red' }}>
        Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {error && <p style={{ color: 'red' }}>Connection error occurred</p>}

      <button onClick={reconnect}>Reconnect</button>

      <h2>Recent Messages ({messages.length})</h2>
      <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ margin: '10px 0', padding: '10px', background: '#f0f0f0' }}>
            <strong>{msg.type}</strong> — {msg.message}
            <br />
            <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDashboard;