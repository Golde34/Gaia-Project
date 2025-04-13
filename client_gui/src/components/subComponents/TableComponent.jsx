import React, { useEffect, useRef } from "react";
import { StatusOnlineIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "./MessageBox";
import { getDoneTasks } from "../../api/store/actions/task_manager/task.actions";
import { Badge, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";

const TableComponent = () => {
  const userId = "1"; // Replace with actual user ID
  const dispatch = useDispatch();

  const { loading, error, doneTasks } = useSelector((state) => state.doneTasks);
  const didGetDoneTaskRef = useRef();
  useEffect(() => {
    if (didGetDoneTaskRef.current) return;
    dispatch(getDoneTasks(userId));
    didGetDoneTaskRef.current = true;
  }, [dispatch]);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <MessageBox message={error} />
      ) : (
        doneTasks.length === 0 ? (
          <div></div>
        ) :
          <Card className="mt-4">
            <Title>Your done tasks in 1 week</Title>
            <Table className="mt-5">
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Duration</TableHeaderCell>
                  <TableHeaderCell>Priority</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {doneTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Text>{task.duration} Hours</Text>
                    </TableCell>
                    <TableCell>
                      <Text>{task.priority}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge color="emerald" icon={StatusOnlineIcon}>
                        {task.status} 
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
      )

      }

    </>
  );
};

export default TableComponent;