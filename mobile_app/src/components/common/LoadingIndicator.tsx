import { colors } from "@/src/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoadingIndicatorProps {
	size?: "small" | "large";
	color?: string;
}
const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ size = "large", color = colors.light }) => {
	return (
		<View style={styles.container}>
			<ActivityIndicator size={size} color={color} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	loadingText: {
		color: "#fff",
		fontSize: 16,
		marginTop: 10,
	},
});

export default LoadingIndicator;