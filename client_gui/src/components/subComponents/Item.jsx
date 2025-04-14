import { ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";
import { Bold, Card, Col, DonutChart, Flex, Grid, List, ListItem, Metric, Tab, TabGroup, TabList, Text, Title } from "@tremor/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDoneTasks } from "../../api/store/actions/task_manager/task.actions";
import { useNavigate } from "react-router-dom";

const dataFormatter = (number) => {
  return Intl.NumberFormat("us").format(number).toString() + " Tasks";
};

const SalesItem = () => {
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
        doneTasks.length === 0 ? (
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
                  <Text className="mt-8">Total Done Tasks</Text>
                  <Metric>{doneTasks.reduce((acc, task) => acc + task.count, 0)}</Metric>
                </Col>
                <Col numColSpan={1}>
                  <Text className="mt-8">
                    <Bold>Number Done Tasks</Bold>
                  </Text>
                  <Text>Your tasks in {doneTasks.length} group tasks</Text>
                </Col>
              </Grid>
              {selectedIndex === 0 ? (
                <>
                  <DonutChart
                    data={doneTasks}
                    dataFormatter={dataFormatter}
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
                      <Bold>GroupTaskId</Bold>
                    </Text>
                    <Text>Number Done Tasks</Text>
                  </Flex>
                  <List className="mt-4">
                    {doneTasks.map((task) => (
                      <ListItem key={task.groupTaskId}>
                        <Text><button onClick={() => handleNavigate(task)} className="text-blue-500 hover:underline">{task.name}</button></Text>
                        <Flex className="space-x-2" justifyContent="end">
                          <Text>
                            {Intl.NumberFormat("us").format(task.count).toString()} Tasks
                          </Text>
                        </Flex>
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

export default SalesItem;