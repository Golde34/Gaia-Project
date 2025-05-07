import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Col, Grid, Metric, TextInput } from '@tremor/react';
import Template from '../../components/template/Template';
import { useMultiWS } from '../../kernels/context/MultiWSContext';
import { useSelector } from 'react-redux';
import { getUserChatHubJwt } from '../../api/store/actions/auth_service/auth.actions';

function ContentArea() {
  const { messages, isConnected, sendMessage } = useMultiWS();

  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);      // array of {from, text, taskResult}
  const [lastBotIndex, setLastBotIndex] = useState(0);     // how many bot msgs we've consumed
  const endRef = useRef(null);

  const jwtUserChatHub = useSelector((state) => state.jwtUserChatHub)
  const { jwtToken } = jwtUserChatHub;
  const getUserJwt = useCallback(() => {
    dispatch(getUserChatHubJwt("ChatHub"));
  }, [dispatch]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      getUserJwt();
    }, 200);
  }, []);

  useEffect(() => {
    console.log("Received chat messages in: ", messages.chat);
    const botMsgs = messages.chat || [];
    if (botMsgs.length > lastBotIndex) {
      const newOnes = botMsgs.slice(lastBotIndex).map(raw => {
        let text = '';
        let taskResult = null;

        try {
          const parsedRaw = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (parsedRaw && parsedRaw.type === 'taskResult') {
            text = parsedRaw.response || '';
            taskResult = parsedRaw.taskResult || null;
          } else {
            text = parsedRaw.text || raw;
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
    setChatHistory(prev => [...prev, { from: 'user', text: chatInput }]);
    if (!jwtToken) {
      console.error("JWT token is not available, Auth Service Timeout");
      return;
    }
    sendMessage('chat', JSON.stringify({
      type: 'chat_message',
      jwtToken,
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
            <div key={idx} className={`flex ${msg.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <Grid numItems={1}>
                <Col numColSpan={1}>
                  <div
                    className={[
                      'max-w-xs px-4 py-2 rounded-2xl break-words',
                      msg.from === 'bot'
                        ? 'bg-gray-200 text-gray-800'
                        : 'bg-blue-500 text-white'
                    ].join(' ')}
                  > {msg.text} </div>
                </Col>
                <Col numColSpan={1}>
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
                </Col>
              </Grid>
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