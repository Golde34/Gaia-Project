import React, { useEffect, useRef, useState } from "react";
import { StatusOnlineIcon } from "@heroicons/react/outline";
import { useDispatch, useSelector } from "react-redux";
import MessageBox from "../../components/subComponents/MessageBox";
import { Badge, BadgeDelta, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";
import { priorityColor, statusColor } from "../../kernels/utils/field-utils";
import { useNavigate } from "react-router-dom";
import { getActiveTaskBatch } from "../../api/store/actions/schedule_plan/schedule-task.action";

const DailyTasks = () => {
  const userId = "1"; // Replace with actual user ID
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, activeTaskBatch } = useSelector((state) => state.activeTaskBatch);
  const didActiveTaskBatch = useRef();
  useEffect(() => {
    if (didActiveTaskBatch.current) return;
    dispatch(getActiveTaskBatch(userId));
    didActiveTaskBatch.current = true;
  }, [dispatch]);

  const handleRowClick = (taskId) => {
    navigate("/task/detail/" + taskId);
  }
  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <MessageBox message={error} />
      ) : (
        activeTaskBatch === null || activeTaskBatch === undefined || activeTaskBatch.length === 0 ? (
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
                {activeTaskBatch.map((task) => (
                  <TableRow key={task.id}
                    onClick={() => handleRowClick(task.taskId)}
                    className="hover:bg-gray-100 cursor-pointer transition-colors">
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