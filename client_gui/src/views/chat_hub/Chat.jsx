import { Card, Col, Grid } from '@tremor/react';
import { useSearchParams } from 'react-router-dom';
import Template from '../../components/template/Template';
import DialogueList from './DialogueList';
import ChatComponent2 from './ChatComponent2';

export default function Chat() {
  const [searchParams] = useSearchParams();
  const dialogueId = searchParams.get("dialogueId");

  return (
    <Template>
      <Grid numItems={9}>
        <Col numColSpan={2} className="me-2">
          <Card className="h-full me-2">
            <DialogueList />
          </Card>
        </Col>
        <Col numColSpan={7} className="ms-2">
          <ChatComponent2 key={dialogueId} />
        </Col>
      </Grid>
    </Template>
  );
}