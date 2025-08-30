import { colors, fonts, sizes } from "@/src/constants/theme";
import { StyleSheet } from "react-native";

const loginStyle = StyleSheet.create({
    container: {
        justifyContent: "center",
        padding: sizes.large,
        backgroundColor: colors.dark,
        flex: 1,
    },
    title: {
        fontSize: sizes.title,
        fontFamily: fonts.family.medium,
        marginBottom: sizes.large,
        color: colors.blue,
    },
    subtitle: {
        fontSize: sizes.large,
        marginBottom: sizes.large,
        color: colors.light,
    },
    regularText: {
        fontSize: sizes.medium,
        fontFamily: fonts.family.regular,
        color: colors.light,
    },
    header: { justifyContent: "center", alignItems: "center" },
    body: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: sizes.large,
    },
    orDividerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: sizes.large,
    },
    orDividerLine: {
        height: 1,
        width: sizes.medium,
        backgroundColor: colors.blue,
        marginHorizontal: sizes.regular,
    },
    orDividerText: {
        fontSize: sizes.medium,
        color: colors.light,
        fontFamily: fonts.family.regular,
    },
    buttonSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footer: { justifyContent: "center", alignItems: "center" },
});

export default loginStyle;