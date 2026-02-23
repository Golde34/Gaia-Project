import { Flex, Grid, Text, Title } from "@tremor/react"
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTaskList } from "../../api/store/actions/task_manager/task.actions";
import { TaskCard } from "./TaskCard";
import { useCallback } from "react";
import MessageBox from "../../components/subComponents/MessageBox";


const TaskList = (props) => {
	const dispatch = useDispatch();

	const projectId = props.projectId;
	const groupTaskId = props.groupTaskId;
	const listTasks = useSelector((state) => state.taskList);
	const { loading, error, tasks } = listTasks;

	const getTasks = useCallback(() => {
        dispatch(getTaskList(groupTaskId));
    }, [dispatch, groupTaskId]);

	const debounceRef = useRef(null);

    useEffect(() => {
		clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => {
			getTasks();
		}, 200);
		return () => clearTimeout(debounceRef.current);
    }, [getTasks]);

	return (
		<div>
			{loading ? (
				<Text>Loading...</Text>
			) : error ? (
				<MessageBox message={error} />	
			) : (
				<>
					{
						tasks.doneTaskList.length + tasks.notDoneTaskList.length === 0 ? (
							<p>No Tasks</p>
						) : (
							<>
								{tasks.notDoneTaskList.length === 0 ? (
									<p></p>
								) : (
									<>
										<Flex className="mt-10" justifyContent="center">
											<Title className="text-2xl font-bold text-gray-800">Not Done Task List</Title>
										</Flex>
										<Grid numItems={3} className="gap-4 mt-9">
											{tasks.notDoneTaskList.map((task) => (
												<TaskCard key={task.id} task={task} 
													projectId={projectId} groupTaskId={groupTaskId} />
											))}
										</Grid>
									</>
								)
								}
								{tasks.doneTaskList.length === 0 ? (
									<p></p>
								) : (
									<>
										<Flex className="mt-5" justifyContent="center">
											<Title className="text-2xl font-bold text-gray-800">Done Task List</Title>
										</Flex>
										<Grid numItems={3} className="gap-4 mt-9">
											{tasks.doneTaskList.map((task) => (
												<TaskCard key={task.id} task={task} 
													projectId={projectId} groupTaskId={groupTaskId} />
											))}
										</Grid>
									</>
								)
								}
							</>
						)
					}
				</>
			)
			}
		</div>
	)
}

export default TaskList;