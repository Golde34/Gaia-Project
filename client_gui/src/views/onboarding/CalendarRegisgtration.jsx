import { Button, Card, Col, Grid, Metric, Title } from "@tremor/react";
import ChatComponent from "../chat_hub/ChatComponent";

const CalendarRegistration = ({ onNext, onSkip }) => {
    return (
        <>
            <Grid numItems={9}>
                <Col numColSpan={4}>
                    <ChatComponent chatType={'onboarding'} />
                </Col>
                <Col numColSpan={5}>
                    <Metric className="text-2xl mb-5">
                        Calendar Registration
                    </Metric>
                    <Card className="ms-5 h-full">
                        <div className="p-4">
                            <Title className="mb-4">
                                Connect Your Calendar
                            </Title>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button variant="light" onClick={onSkip}>
                                Skip
                            </Button>
                            <Button variant="primary" onClick={onNext}>
                                Continue
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Grid>
        </>
    )
}

export default CalendarRegistration;
