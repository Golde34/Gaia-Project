import { colors, sizes } from "@/src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
	StyleSheet,
	Text,
	TextInput,
	TextInputProps,
	View,
} from "react-native";

interface InputFieldProps extends TextInputProps {
	label?: string;
	error?: string;
	iconName?: keyof typeof Ionicons.glyphMap; // e.g. "mail", "lock-closed"
}

const InputField: React.FC<InputFieldProps> = ({ label, error, iconName, ...props }) => (
	<View style={styles.container}>
		<View style={styles.inputWrapper}>
			{iconName && (
				<View style={styles.iconContainer}>
					<Ionicons name={iconName} size={sizes.tall} color="#fff" />
				</View>
			)}
			<TextInput
				style={[styles.input, error && styles.inputError]}
				placeholderTextColor={colors.grey}
				placeholder={label}
				{...props}
			/>
		</View>
		{error && <Text style={styles.error}>{error}</Text>}
	</View>
);

const styles = StyleSheet.create({
	container: {
		marginVertical: sizes.small,
		width: "90%",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: sizes.small,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	iconContainer: {
		backgroundColor: colors.black,
		padding: sizes.medium,
		borderTopLeftRadius: sizes.small,
		borderBottomLeftRadius: sizes.small,
		justifyContent: "center",
		alignItems: "center",
	},
	input: {
		flex: 1,
		padding: sizes.small,
		fontSize: sizes.medium,
		backgroundColor: "#fff",
		borderTopRightRadius: sizes.small,
		borderBottomRightRadius: sizes.small,
	},
	inputError: {
		borderColor: "red",
	},
	error: {
		marginTop: sizes.small,
		color: "red",
		fontSize: sizes.medium,
	},
});

export default InputField;
