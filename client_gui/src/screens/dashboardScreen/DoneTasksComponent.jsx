import { ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";
import { Bold, Card, Col, DonutChart, Flex, Grid, List, ListItem, Metric, Tab, TabGroup, TabList, Text, Title } from "@tremor/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDoneTasks } from "../../api/store/actions/task_manager/task.actions";
import { useNavigate } from "react-router-dom";
import MessageBox from "../../components/subComponents/MessageBox";

const DoneTasksComponent = () => {
  const userId = "1";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, doneTasks } = useSelector((state) => state.doneTasks);
  const didGetDoneTaskRef = useRef();
  useEffect(() => {
    if (didGetDoneTaskRef.current) return;
    dispatch(getDoneTasks(userId));
    didGetDoneTaskRef.current = true;
  }, [dispatch]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const handleNavigate = (task) => {
    localStorage.setItem("activeTab", task.groupTaskId);
    navigate(`/project/${task.projectId}`);
  }

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <MessageBox message={error} />
      ) : (
        doneTasks === undefined || doneTasks === null || doneTasks.length === 0 ? (
          <div></div>
        ) : (
          <div>
            <Card className="max-w-full mx-auto">
              <Flex className="space-x-8 flex-col lg:flex-row">
                <Title className="">Overview</Title>
                <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                  <TabList variant="solid">
                    <Tab icon={ChartPieIcon}>Chart</Tab>
                    <Tab icon={ViewListIcon}>List</Tab>
                  </TabList>
                </TabGroup>
              </Flex>
              <Grid numItems={2}>
                <Col numColSpan={1}>
                  <Text className="mt-8">Total Number of Completed Tasks</Text>
                  <Metric>{doneTasks.reduce((acc, task) => acc + task.count, 0)}</Metric>
                </Col>
                <Col numColSpan={1}>
                  <Text className="mt-8">
                    <Bold>Completed Tasks Summary</Bold>
                  </Text>
                  <Text>You have completed tasks in {doneTasks.length} different groups</Text>
                </Col>
              </Grid>
              {selectedIndex === 0 ? (
                <>
                  <DonutChart
                    data={doneTasks}
                    showAnimation={true}
                    category="count"
                    index="name"
                    className="mt-6"
                  />
                </>
              ) : (
                <>
                  <Flex className="mt-8" justifyContent="between">
                    <Text className="truncate">
                      <Bold>Group Task Overview</Bold>
                    </Text>
                    <Text>Task Count</Text>
                  </Flex>
                  <List className="mt-4">
                    {doneTasks.map((task) => (
                      <ListItem key={task.groupTaskId}>
                        <Text><button onClick={() => handleNavigate(task)} className="text-blue-500 hover:underline">{task.name}</button></Text>
                        <Text>
                          {Intl.NumberFormat("us").format(task.count).toString()} Tasks
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {/* <Flex className="mt-6 pt-4 border-t">
                <Button
                  size="xs"
                  variant="light"
                  icon={ArrowRightIcon}
                  iconPosition="right"
                >
                  View more
                </Button>
              </Flex> */}
            </Card>
          </div>
        )
      )
      }

    </>
  );
};

export default DoneTasksComponent;