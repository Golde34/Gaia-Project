import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useAppDispatch, useAppSelector } from "@/src/hooks/reduxHooks";
import { fetchProjects } from "@/src/features/project/projectSlice";
import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import projectStyle from "@/src/features/project/projectStyle";

export default function ProjectsScreen() {
	const dispatch = useAppDispatch();
	const { token } = useAppSelector((state) => state.login);
	const { projects, loading, error } = useAppSelector(
		(state) => state.projects,
	);

	useEffect(() => {
		if (token) {
			dispatch(fetchProjects());
		}
	}, [dispatch, token]);

	if (!token) {
		return (
			<View style={projectStyle.container}>
				<Text style={projectStyle.title}>
					Please login to view projects.
				</Text>
			</View>
		);
	}

	return (
		<View style={projectStyle.container}>
			{loading ? (
				<LoadingIndicator />
			) : error ? (
				<Text style={projectStyle.errorText}>{error}</Text>
			) : (
				<FlatList
					data={projects}
					keyExtractor={(item) => item.id.toString()}
					renderItem={({ item }) => (
						<View style={projectStyle.projectContainer}>
							<Text style={projectStyle.projectName}>
								{item.name}
							</Text>
							{item.tasks.map((task) => (
								<Text
									key={task.id}
									style={projectStyle.taskName}
								>
									- {task.name}
								</Text>
							))}
						</View>
					)}
				/>
			)}
		</View>
	);
}
