import { ArrowRightIcon, ChartPieIcon, ViewListIcon } from "@heroicons/react/outline";
import { Bold, Button, Card, Divider, DonutChart, Flex, List, ListItem, Metric, Tab, TabGroup, TabList, Text, Title } from "@tremor/react";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDoneTasks } from "../../api/store/actions/task_manager/task.actions";

const stocks = [
  {
    name: "Off Running AG",
    value: 10456,
    performance: "6.1%",
    deltaType: "increase",
  },
  {
    name: "Not Normal Inc.",
    value: 5789,
    performance: "1.2%",
    deltaType: "moderateDecrease",
  },
  {
    name: "Logibling Inc.",
    value: 4367,
    performance: "2.3%",
    deltaType: "moderateIncrease",
  },
  {
    name: "Raindrop Inc.",
    value: 3421,
    performance: "0.5%",
    deltaType: "moderateDecrease",
  },
  {
    name: "Mwatch Group",
    value: 1432,
    performance: "3.4%",
    deltaType: "decrease",
  },
];

const dataFormatter = (number) => {
  return "$ " + Intl.NumberFormat("us").format(number).toString();
};

const SalesItem = () => {
  const userId = "1";
  const dispatch = useDispatch();

  const { loading, error, doneTasks } = useSelector((state) => state.doneTasks);
  const didGetDoneTaskRef = useRef();
  useEffect(() => {
    if (didGetDoneTaskRef.current) return;
    dispatch(getDoneTasks(userId));
    didGetDoneTaskRef.current = true;
  }, [dispatch]);


  const [selectedIndex, setSelectedIndex] = useState(0);

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
              <Text className="mt-8">Total Done Tasks</Text>
              <Metric>{doneTasks.length}</Metric>
              <Divider />
              <Text className="mt-8">
                <Bold>Asset Allocation</Bold>
              </Text>
              <Text>1 Asset class - 5 Holdings</Text>
              {selectedIndex === 0 ? (
                <DonutChart
                  data={stocks}
                  valueFormatter={dataFormatter}
                  showAnimation={false}
                  category="value"
                  index="name"
                  className="mt-6"
                />
              ) : (
                <>
                  <Flex className="mt-8" justifyContent="between">
                    <Text className="truncate">
                      <Bold>Stocks</Bold>
                    </Text>
                    <Text>Since transaction</Text>
                  </Flex>
                  <List className="mt-4">
                    {stocks.map((stock) => (
                      <ListItem key={stock.name}>
                        <Text>{stock.name}</Text>
                        <Flex className="space-x-2" justifyContent="end">
                          <Text>
                            $ {Intl.NumberFormat("us").format(stock.value).toString()}
                          </Text>
                        </Flex>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              <Flex className="mt-6 pt-4 border-t">
                <Button
                  size="xs"
                  variant="light"
                  icon={ArrowRightIcon}
                  iconPosition="right"
                >
                  View more
                </Button>
              </Flex>
            </Card>
          </div>
        )
      )
      }

    </>
  );
};

export default SalesItem;