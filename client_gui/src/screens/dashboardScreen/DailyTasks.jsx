import React, { useEffect, useRef, useState } from "react";
import { StatusOnlineIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "../../components/subComponents/MessageBox";
import { Badge, BadgeDelta, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";
import { getScheduleTaskBatch } from "../../api/store/actions/schedule_plan/schedule-task.action";
import { priorityColor, statusColor } from "../../kernels/utils/field-utils";

const DailyTasks = () => {
  const userId = "1"; // Replace with actual user ID
  const dispatch = useDispatch();

  const { loading, error, scheduleTaskBatch } = useSelector((state) => state.scheduleTaskBatch);
  const didScheduleTaskBatchRef = useRef();
  useEffect(() => {
    if (didScheduleTaskBatchRef.current) return;
    dispatch(getScheduleTaskBatch(userId));
    didScheduleTaskBatchRef.current = true;
  }, [dispatch]);

  const [allTasks, setAllTasks] = useState([]);
  useEffect(() => {
    if (scheduleTaskBatch) {
      setAllTasks(Object.values(scheduleTaskBatch).flat());
    }
    console.log("scheduleTaskBatch", allTasks);
  }, [scheduleTaskBatch]);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <MessageBox message={error} />
      ) : (
        allTasks && allTasks.length === 0 ? (
          <div></div>
        ) :
          <Card className="mt-4">
            <Title>Daily Tasks</Title>
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
                {allTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <Text>{task.duration} Hours</Text>
                    </TableCell>
                    <TableCell>
                      <Text>
                        {task.priority.map((priority) => (
                          <Badge key={`${task.id}-${priority}`} className="me-1 mt-1" color={priorityColor(priority)}>{priority}</Badge>
                        ))}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <BadgeDelta deltaType={statusColor(task.status)} icon={StatusOnlineIcon}>
                        {task.status}
                      </BadgeDelta>
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

export default DailyTasks;