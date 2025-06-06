import { Button, Col, Grid, Metric } from "@tremor/react";
import ChatComponent from "../chat_hub/ChatComponent";
import TaskRegistration from "./TaskRegistration";
import { motion } from "framer-motion";

const CalendarRegistration = ({ onNext, onSkip, onPrevious }) => {
    return (
        <>
            <Metric className="text-2xl mb-5">
                Calendar Registration
            </Metric>
            <Grid numItems={9}>
                <Col numColSpan={4}>
                    <div className="m-4">
                        <ChatComponent chatType={'onboarding'} />
                    </div>
                </Col>
                <Col numColSpan={5}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.8, delay: 3 }}
                    >
                        <TaskRegistration />
                    </motion.div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={onPrevious}>
                            Back
                        </Button>
                        <Button variant="light" onClick={onSkip}>
                            Skip
                        </Button>
                        <Button variant="primary" onClick={onNext}>
                            Continue
                        </Button>
                    </div>
                </Col>
            </Grid>
        </>
    )
}

export default CalendarRegistration;
