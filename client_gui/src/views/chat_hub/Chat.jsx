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
  const [chatHistory, setChatHistory] = useState([]);      // array of {from, text, taskResult}
  const [lastBotIndex, setLastBotIndex] = useState(0);     // how many bot msgs we've consumed
  const endRef = useRef(null);

  // Whenever messages.chat grows, append only the new ones:
  useEffect(() => {
    console.log("Received chat messages in: ", messages.chat);
    const botMsgs = messages.chat || [];
    if (botMsgs.length > lastBotIndex) {
      // const newOnes = botMsgs.slice(lastBotIndex).map(raw => {
      //   const text = typeof raw === 'string' ? raw : raw.text || '';

      //   const taskResult = raw.type === 'taskResult' ? raw.taskResult : null;
      //   console.log("New bot message: ", text, taskResult);
      //   return { from: 'bot', text, taskResult };
      // });
      const newOnes = botMsgs.slice(lastBotIndex).map(raw => {
        let text = '';
        let taskResult = null;

        try {
          const parsedRaw = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (parsedRaw && parsedRaw.type === 'taskResult') {
            text = parsedRaw.response || '';
            taskResult = parsedRaw.taskResult || null;
          } else {
            text = parsedRaw.text || raw;  // Nếu parsedRaw không có text, dùng raw (chuỗi gốc)
          }
        } catch (error) {
          text = raw;
        }

        return { from: 'bot', text, taskResult };
      });
      console.log("New bot message: ", newOnes);
      setChatHistory(prev => [...prev, ...newOnes]);
      setLastBotIndex(botMsgs.length);
    }
  }, [messages.chat, lastBotIndex]);

  // Scroll to bottom on every chatHistory change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    // 1. Optimistically show the user’s own message
    setChatHistory(prev => [...prev, { from: 'user', text: chatInput }]);
    // 2. Send it over WS
    sendMessage('chat', JSON.stringify({
      type: 'chat_message',
      userId,
      text: chatInput
    }));
    setChatInput('');
  };

  return (
    <>
      <Metric className="text-2xl font-bold text-gray-800 mb-5">
        Chat Hub
      </Metric>
      <Card className="flex flex-col h-full">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={[
                  'max-w-xs px-4 py-2 rounded-2xl break-words',
                  msg.from === 'bot'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-blue-500 text-white'
                ].join(' ')}
              >
                {msg.text}
              </div>
              {/* Task Result card (if any) */}
              {msg.taskResult && (
                <div className="mt-4">
                  <div className="bg-green-100 p-4 rounded-xl">
                    <h4 className="font-bold">Task Created</h4>
                    <p><strong>Title:</strong> {msg.taskResult.title}</p>
                    <p><strong>Priority:</strong> {msg.taskResult.priority}</p>
                    <p><strong>Start Date:</strong> {new Date(msg.taskResult.startDate).toLocaleString()}</p>
                    <p><strong>Deadline:</strong> {new Date(msg.taskResult.deadline).toLocaleString()}</p>
                    {/* Add more task details here if needed */}
                  </div>
                </div>
              )}
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

export default function Chat() {
  return (
    <Template>
      <ContentArea />
    </Template>
  );
}