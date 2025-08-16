import { Card, Col, Grid, Metric } from '@tremor/react';
import Template from '../../components/template/Template';
import ChatComponent from './ChatComponent';
import DialogueList from './DialogueList';

export default function Chat() {
  return (
    <Template>
      <Metric className="text-2xl font-bold text-gray-800 mb-5">
        Chat Hub
      </Metric>
      <Grid numItems={9}>
        <Col numColSpan={2} className="me-2">
          <Card className="h-full me-2">
            <DialogueList />
          </Card>
        </Col>
        <Col numColSpan={7} className="ms-2">
          <ChatComponent />
        </Col>
      </Grid>
    </Template>
  );
}