import { colors, fonts, sizes } from "@/src/constants/theme";
import { StyleSheet } from "react-native";

const projectStyle = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.dark,
		padding: sizes.large,
	},
	title: {
		fontSize: sizes.large,
		fontFamily: fonts.family.bold,
		color: colors.light,
		marginBottom: sizes.large,
		textAlign: "center",
	},
	projectContainer: {
		marginBottom: sizes.large,
		backgroundColor: colors.light,
		padding: sizes.medium,
		borderRadius: sizes.small,
	},
	projectName: {
		fontSize: sizes.medium,
		fontFamily: fonts.family.medium,
		color: colors.black,
		marginBottom: sizes.small,
	},
	taskName: {
		fontSize: sizes.small + 2,
		fontFamily: fonts.family.regular,
		color: colors.black,
		marginLeft: sizes.small,
	},
	errorText: {
		color: colors.light,
		fontSize: sizes.medium,
		fontFamily: fonts.family.regular,
		textAlign: "center",
	},
});

export default projectStyle;
