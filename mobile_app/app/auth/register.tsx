import ButtonIcon from "@/src/components/common/ButtonIcon";
import ReturnButton from "@/src/components/common/ReturnButton";
import { sizes } from "@/src/constants/theme";
import { register, resetStatus } from "@/src/features/auth/registerSlice";
import { Ionicons as IoniconsFont } from "@expo/vector-icons";
import * as Font from "expo-font";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import registerStyle from "@/src/features/auth/registerStyle";
import InputField from "../../src/components/auth/InputField";
import Button from "../../src/components/common/Button";
import { useAppDispatch, useAppSelector } from "../../src/hooks/reduxHooks";

export default function RegisterScreen() {
	const [iconsLoaded, setIconsLoaded] = useState(false);
	useEffect(() => {
		Font.loadAsync({ ...IoniconsFont.font }).then(() =>
			setIconsLoaded(true)
		);
	}, []);

	// Select loading, user, and token from auth slice
	const { loading, status } = useAppSelector((state) => state.register);
	const router = useRouter();
	useEffect(() => {
		if (status == "success") {
			dispatch(resetStatus());
			setName("");
			setUsername("");
			setEmail("");
			setPassword("");
			setConfirmPassword("");
			router.push("/auth/login");
		} else if (status == "error") {
			// Handle error case, e.g., show an alert or a message
			console.error("Registration failed");
		}
	}, [status, router]);

	const dispatch = useAppDispatch();
	const [name, setName] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const handleRegister = () => {
		dispatch(
			register({
				name,
				username,
				email,
				password,
				matchingPassword: confirmPassword,
				isUsing2FA: false,
				isBoss: false,
			})
		);
	};

	if (loading || !iconsLoaded) {
		return (
			<View style={registerStyle.container}>
				<LoadingIndicator />
			</View>
		);
	}

	return (
		<View style={registerStyle.container}>
			<ReturnButton onPress={() => router.back()} />
			<View style={registerStyle.header}>
				<Text style={registerStyle.title}>GAIA</Text>
				<Text style={registerStyle.subtitle}>Management App</Text>
			</View>
			<View style={registerStyle.body}>
				<Text
					style={[registerStyle.regularText, { marginBottom: sizes.large }]}
				>
					Create your account
				</Text>
				<InputField
					iconName="text"
					label="Name"
					value={name}
					onChangeText={setName}
					autoCapitalize="none"
					autoComplete="name" // updated
					keyboardType="default"
					textContentType="name"
				/>
				<InputField
					iconName="person"
					label="Username"
					value={username}
					onChangeText={setUsername}
					autoCapitalize="none"
					autoComplete="username" // updated
					keyboardType="default"
					textContentType="username"
				/>
				<InputField
					iconName="mail"
					label="Email"
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					autoComplete="email" // updated
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
					autoComplete="password" // updated
					textContentType="password"
				/>
				<InputField
					iconName="lock-closed"
					label="Confirm Password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
					autoCapitalize="none"
					autoComplete="password" // updated
					textContentType="password"
				/>
				<Button title="Register" onPress={handleRegister} />
				<View style={registerStyle.orDividerContainer}>
					<View style={registerStyle.orDividerLine} />
					<Text style={registerStyle.orDividerText}>Or Register with</Text>
					<View style={registerStyle.orDividerLine} />
				</View>
				<View style={registerStyle.buttonSection}>
					<ButtonIcon
						iconName="logo-google"
						onPress={() => console.log("Google registration")}
					/>
					<ButtonIcon
						iconName="logo-facebook"
						onPress={() => console.log("Facebook registration")}
					/>
					<ButtonIcon
						iconName="logo-twitter"
						onPress={() => console.log("Apple registration")}
					/>
				</View>
			</View>
		</View>
	);
}
