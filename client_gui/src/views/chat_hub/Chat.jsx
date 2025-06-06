import { Metric } from '@tremor/react';
import Template from '../../components/template/Template';
import ChatComponent from './ChatComponent';

export default function Chat() {
  return (
    <Template>
      <Metric className="text-2xl font-bold text-gray-800 mb-5">
        Chat Hub
      </Metric>
      <ChatComponent chatType={'chat'} />
    </Template>
  );
}