import * as Font from "expo-font";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";

import { store } from "../src/store";

export default function RootLayout() {
	const [fontsLoaded, setFontsLoaded] = useState(false);

	useEffect(() => {
		Font.loadAsync({
			"Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
			"Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
			"Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
			"Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
			// Add more weights/styles if needed
		}).then(() => setFontsLoaded(true));
	}, []);

	if (!fontsLoaded) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<Provider store={store}>
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen
					name="projects/index"
					options={{ title: "Projects" }}
				/>
				<Stack.Screen
					name="auth/login"
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="auth/register"
					options={{ headerShown: false }}
				/>
			</Stack>
		</Provider>
	);
}
