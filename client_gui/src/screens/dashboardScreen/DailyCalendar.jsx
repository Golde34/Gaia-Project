import { Button, Flex, Subtitle, Title } from "@tremor/react"
import { useState } from "react";

const DailyCalendar = () => {
    const [getTimeBubbleConfig] = useState(true);
    return (
        <>
            <Flex className="justify-between items-center mt-4">
                <Title className="text-lg">Your Daily Calendar</Title>
                {getTimeBubbleConfig ? (
                    <Button color="indigo" variant="primary">
                        Auto generate calendar
                    </Button>
                ) : (
                    <a href="#">
                        <Subtitle className="text-gray-400 font-medium underline">
                            You must create a calendar config first to use this feature
                        </Subtitle>
                    </a>
                )
                }
            </Flex >
        </>
    )
}

export default DailyCalendar;