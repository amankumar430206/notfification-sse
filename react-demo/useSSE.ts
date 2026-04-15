import { useEffect, useRef, useState, useCallback } from 'react';

interface SSEMessage {
  type: string;
  message: string;
  data?: any;
  userId?: string;
  timestamp: string;
}

interface UseSSEOptions {
  userId: string | null;
  onMessage?: (data: SSEMessage) => void;   // Optional callback
  onError?: (error: Event) => void;
  onOpen?: () => void;
}

export const useSSE = (options: UseSSEOptions) => {
  const { userId, onMessage, onError, onOpen } = options;

  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup function
  const closeConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    // Close previous connection if userId changes or becomes null
    closeConnection();

    if (!userId) {
      setIsConnected(false);
      return;
    }

    const url = `/events?userId=${encodeURIComponent(userId)}`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
      onOpen?.();
      console.log(`SSE connected for user: ${userId}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data);
        
        setMessages((prev) => [data, ...prev].slice(0, 50)); // keep latest 50
        
        // Optional callback
        onMessage?.(data);
      } catch (err) {
        console.error('Failed to parse SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      setIsConnected(false);
      setError(err);
      onError?.(err);
      console.error('SSE connection error', err);
      
      // Optional: auto-reconnect logic can be added here
    };

    // Cleanup on unmount or when userId changes
    return () => {
      closeConnection();
    };
  }, [userId, onMessage, onError, onOpen, closeConnection]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    closeConnection();
    // The useEffect will automatically restart if userId is still valid
  }, [closeConnection]);

  return {
    messages,
    isConnected,
    error,
    reconnect,
    close: closeConnection,
  };
};