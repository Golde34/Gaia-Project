import { colors, fonts, sizes } from "@/src/constants/theme";
import { StyleSheet } from "react-native";

const homeStyle = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.dark,
		justifyContent: "center",
		alignItems: "center",
		padding: sizes.large,
	},
	title: {
		fontSize: sizes.large,
		fontFamily: fonts.family.bold,
		color: colors.light,
		marginBottom: sizes.large * 2,
	},
	link: {
		width: "80%",
		marginVertical: sizes.medium,
		alignItems: "center",
		paddingVertical: sizes.medium,
		backgroundColor: colors.light,
		borderRadius: sizes.small,
		textAlign: "center",
	},
	linkText: {
		color: colors.black,
		fontSize: sizes.medium,
		fontFamily: fonts.family.medium,
		textAlign: "center",
	},
	paragraph: {
		color: colors.light,
		fontSize: sizes.medium,
		fontFamily: fonts.family.regular,
		marginBottom: sizes.large,
		textAlign: "center",
	},
});

export default homeStyle;