import { CalendarIcon, CheckCircleIcon } from "@heroicons/react/outline";
import { Card, Flex, Tab, TabGroup, TabList, Title } from "@tremor/react";
import { useState } from "react";
import PriorityTasks from "./PriorityTasks";

const DailyTasks = () => {

  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <>
      <Card className="max-w-full mx-auto">
        <Flex className="space-x-8 flex-col lg:flex-row">
          <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
            <TabList variant="solid">
              <Tab icon={CalendarIcon}>Daily Calendar</Tab>
              <Tab icon={CheckCircleIcon}>Priority Tasks</Tab>
            </TabList>
          </TabGroup>
        </Flex>
        {selectedIndex === 0 ? (
          <>
            <Title className="mt-8">Daily Calendar</Title>
          </>
        ) : (
          <>
            <PriorityTasks />
          </>
        )}
      </Card>
    </>
  )
};

export default DailyTasks;