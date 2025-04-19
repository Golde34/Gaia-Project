import { useDispatch } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Metric, TextInput } from '@tremor/react';
import Template from '../../components/template/Template';
import { useMultiWS } from '../../kernels/context/MultiWSContext';

function ContentArea() {
  const userId = '1';
  const dispatch = useDispatch();
  const { messages, isConnected, sendMessage } = useMultiWS();

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    console.log('Chat messages:', messages.chat);
    const incoming = (messages.chat || []).map(raw => {
        console.log('raw:', raw);
        console.log('type of raw:', typeof raw);
        return raw;
    });     
        setChatHistory(incoming);
  }, [messages.chat]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    const msgObj = { from: 'user', text: chatInput };
    setChatHistory(prev => [...prev, msgObj]);
    sendMessage('chat', JSON.stringify({ type: 'chat_message', userId, text: chatInput }));
    setChatInput('');
  };

  return (
    <>
      <Metric className="text-2xl font-bold text-gray-800 mb-5">Chat Hub</Metric>
      <Card className="flex flex-col h-full ">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl break-words ` +
                  (msg.from === 'bot'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-500 text-white')
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex items-center p-4 border-t">
          <TextInput
            placeholder="Type a message..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 mr-2"
          />
          <Button onClick={handleSend} disabled={!isConnected.chat}>
            Send
          </Button>
        </div>
      </Card>
    </>
  );
}

const Chat = () => (
  <Template>
    <ContentArea />
  </Template>
);

export default Chat;
