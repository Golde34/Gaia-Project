import { colors, sizes } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

interface ButtonIconProps {
	iconName?: keyof typeof Ionicons.glyphMap; 
	onPress: () => void;
	disabled?: boolean;
}

const ButtonIcon: React.FC<ButtonIconProps> = ({ iconName, onPress }) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={styles.button}
		>
			<Ionicons
				name={iconName}
				size={1.5 * sizes.large}
				color={colors.light}
			/>
		</TouchableOpacity>
	);
};
const styles = StyleSheet.create({
	button: {
		width: 3 * sizes.large,
		height: 3 * sizes.large,
		backgroundColor: colors.dark,
		borderRadius: sizes.small,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: sizes.medium,
		marginHorizontal: sizes.large,
		elevation: 1,
		borderWidth: 0.5 * StyleSheet.hairlineWidth, // super slim border
		borderColor: colors.grey,
		shadowColor: colors.grey,
	},
	disabledButton: {
		backgroundColor: "#ccc",
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
	},
	disabledText: {
		color: "#888",
	},
});

export default ButtonIcon;
