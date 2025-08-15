export const colors = {
	dark: "#1E293B",
	light: "#D9D9D9",
	black: "#111827",
	blue: "#006EE9",
	grey: "#9A9A9A",
};

export const fonts = {
	family: {
		regular: "Montserrat-Regular",
		light: "Montserrat-Light",
		bold: "Montserrat-Bold",
		medium: "Montserrat-Medium",
	},
	weights: {
		regular: "400",
		bold: "700",
	},
};

export const sizes = {
	small: 8,
    regular: 12,
    medium: 16,
	tall: 20,
    large: 24,
    title: 32,
};

export const theme = {
	colors,
	fonts: {
		regular: "System",
		bold: "System",
	},
	borderRadius: 8,
	padding: 16,
};

export type Theme = typeof theme;
