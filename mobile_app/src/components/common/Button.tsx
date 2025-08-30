import { colors, fonts, sizes } from "@/src/constants/theme";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
	title: string;
	onPress: () => void;
	disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={styles.button}
		>
			<Text style={styles.buttonText}>
				{title}
			</Text>
		</TouchableOpacity>
	);
};
const styles = StyleSheet.create({
	button: {
		width: "90%",
		backgroundColor: colors.black,
		padding: sizes.medium,
		borderRadius: sizes.small,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: sizes.medium,
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	buttonText: {
		color: colors.light,
		fontSize: sizes.medium,
		fontFamily: fonts.family.regular,
	},
	disabledText: {
		color: "#888",
	},
});

export default Button;
