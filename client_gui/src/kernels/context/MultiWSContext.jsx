import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";

const MultiWSContext = createContext(null);
export const useMultiWS = () => useContext(MultiWSContext);

export const MultiWSProvider = ({
  children,
  endpoints = {},       // { notification: "ws://...", chat: "ws://..." }
  reconnectDelay = 5000, // ms
}) => {
  const userId = "1";

  const [messages, setMessages] = useState(
    Object.keys(endpoints).reduce((acc, ch) => ({ ...acc, [ch]: [] }), {})
  );
  const [isConnected, setIsConnected] = useState(
    Object.keys(endpoints).reduce((acc, ch) => ({ ...acc, [ch]: false }), {})
  );
  const socketsRef = useRef({});               // will hold socketsRef.current[channel]
  const reconnectTimeoutRef = useRef({});      // will hold reconnectTimeoutRef.current[channel]

  const attemptReconnect = useCallback(
    (channel, url) => {
      console.log(`[${channel}] scheduling reconnect in ${reconnectDelay}ms`);
      reconnectTimeoutRef.current[channel] = setTimeout(() => {
        connect(channel, url);
      }, reconnectDelay);
    },
    [reconnectDelay] 
  );

  const connect = useCallback(
    (channel, url) => {
      console.log(`[${channel}] connecting to ${url}?userId=${userId}`);
      const client = new W3CWebSocket(`${url}?userId=${userId}`);

      client.onopen = () => {
        console.log(`[${channel}] connected`);
        setIsConnected((prev) => ({ ...prev, [channel]: true }));
        clearTimeout(reconnectTimeoutRef.current[channel]);
      };

      client.onmessage = (evt) => {
        console.log(`[${channel}] message:`, evt.data);
        setMessages((prev) => ({
          ...prev,
          [channel]: [...prev[channel], evt.data],
        }));
      };

      client.onclose = () => {
        console.log(`[${channel}] disconnected`);
        setIsConnected((prev) => ({ ...prev, [channel]: false }));
        attemptReconnect(channel, url);
      };

      client.onerror = (err) => {
        client.close();
      };

      socketsRef.current[channel] = client;
    },
    [userId, attemptReconnect]
  );

  const sendMessage = (channel, msg) => {
    console.log(`[${channel}] sendMessage and socker ready state ${socketsRef.current[channel]}:`, msg);
    if (socketsRef.current[channel] && socketsRef.current[channel].readyState === WebSocket.OPEN) {
      console.log(`[${channel}] sending message:`, msg);
      socketsRef.current[channel].send(msg);
    }
  };

  useEffect(() => {
    Object.entries(endpoints).forEach(([ch, url]) => connect(ch, url));

    return () => {
      Object.values(socketsRef.current).forEach((s) => s.close?.());
      Object.values(reconnectTimeoutRef.current).forEach((t) => clearTimeout(t));
    };
  }, [endpoints, connect]);

  return (
    <MultiWSContext.Provider value={{ messages, isConnected, sendMessage }}>
      {children}
    </MultiWSContext.Provider>
  );
};
