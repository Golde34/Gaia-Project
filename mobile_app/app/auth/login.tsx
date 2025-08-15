import ButtonIcon from "@/src/components/common/ButtonIcon";
import { colors, sizes } from "@/src/constants/theme";
import { login } from "@/src/features/auth/loginSlice";
import { Ionicons as IoniconsFont } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import loginStyle from "@/src/features/auth/loginStyle";
import InputField from "../../src/components/auth/InputField";
import Button from "../../src/components/common/Button";
import { useAppDispatch, useAppSelector } from "../../src/hooks/reduxHooks";

export default function LoginScreen() {
	// Load Ionicons font
	const [iconsLoaded, setIconsLoaded] = useState(false);
	useEffect(() => {
		Font.loadAsync({ ...IoniconsFont.font }).then(() =>
			setIconsLoaded(true)
		);
	}, []);

	// Select loading, user, and token from auth slice
	const { loading, error, user, token } = useAppSelector(
		(state) => state.login
	);
	const router = useRouter();
	useEffect(() => {
		if (user) {
			router.replace("/"); // Redirect to home if already logged in
		}
	}, [user]);

	// setup state for email and password
	const dispatch = useAppDispatch();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const handleLogin = () => {
		dispatch(login({ username: email, password }));
	};

	return (
		<View style={loginStyle.container}>
			{loading || !iconsLoaded ? (
				<LoadingIndicator />
			) : (
				<>
					<View style={loginStyle.header}>
						<Text style={loginStyle.title}>GAIA</Text>
						<Text style={loginStyle.subtitle}>Management App</Text>
					</View>
					<View style={loginStyle.body}>
						{error ? (
							<Text
								style={{
									color: "red",
									marginBottom: sizes.medium,
									textAlign: "center",
								}}
							>
								{error}
							</Text>
						) : null}
						<Text
							style={[
								loginStyle.regularText,
								{ marginBottom: sizes.large },
							]}
						>
							Login to your account
						</Text>
						<InputField
							iconName="mail"
							label="Email"
							value={email}
							onChangeText={setEmail}
							autoCapitalize="none"
							autoComplete="email"
							keyboardType="email-address"
							textContentType="emailAddress"
						/>
						<InputField
							iconName="lock-closed"
							label="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
							autoCapitalize="none"
							autoComplete="password"
							textContentType="password"
						/>
						<Text
							style={[
								loginStyle.regularText,
								{
									fontSize: sizes.regular,
									marginTop: sizes.small,
									width: "90%",
									alignSelf: "center",
									textAlign: "right",
								},
							]}
						>
							Forgot password?
						</Text>
						<Button title="Login" onPress={handleLogin} />
						<View style={loginStyle.orDividerContainer}>
							<View style={loginStyle.orDividerLine} />
							<Text style={loginStyle.orDividerText}>
								Or Login with
							</Text>
							<View style={loginStyle.orDividerLine} />
						</View>
						<View style={loginStyle.buttonSection}>
							<ButtonIcon
								iconName="logo-google"
								onPress={() => console.log("Google login")}
							/>
							<ButtonIcon
								iconName="logo-facebook"
								onPress={() => console.log("Facebook login")}
							/>
							<ButtonIcon
								iconName="logo-twitter"
								onPress={() => console.log("Apple login")}
							/>
						</View>
					</View>
					<View style={loginStyle.footer}>
						<Text style={loginStyle.regularText}>
							Don't have an account?{" "}
							<Link href="/auth/register">
								<Text style={{ color: colors.blue }}>
									Sign Up
								</Text>
							</Link>
						</Text>
					</View>
				</>
			)}
		</View>
	);
}
