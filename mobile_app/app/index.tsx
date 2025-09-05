import { logout } from "@/src/features/auth/loginSlice";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

import LoadingIndicator from "@/src/components/common/LoadingIndicator";
import homeStyle from "@/src/features/index/homeStyle";
import Button from "../src/components/common/Button";
import { restoreSession } from "../src/features/auth/loginSlice";
import { useAppDispatch, useAppSelector } from "../src/hooks/reduxHooks";

const getStartedParagraphs = [
	"Welcome to GAIA! This app helps you manage your tasks efficiently.",
	"Organize your work, set priorities, and track your progress.",
	"Ready to get started? Let's dive in!",
];

export default function HomeScreen() {
	const { loading, user, token } = useAppSelector((state) => state.login);
	const dispatch = useAppDispatch();

	const [showGetStarted, setShowGetStarted] = useState(true);
	const [step, setStep] = useState(0);

	useEffect(() => {
		dispatch(restoreSession());
	}, [dispatch]);

	return (
		<View style={homeStyle.container}>
			{loading ? (
				<LoadingIndicator />
			) : showGetStarted && !token ? (
				<>
					<Text style={homeStyle.title}>Get Started</Text>
					<Text style={homeStyle.paragraph}>
						{getStartedParagraphs[step]}
					</Text>
					<Button
						title={
							step < getStartedParagraphs.length - 1
								? "Next"
								: "Finish"
						}
						onPress={() => {
							if (step < getStartedParagraphs.length - 1) {
								setStep(step + 1);
							} else {
								setShowGetStarted(false);
							}
						}}
					/>
				</>
			) : token ? (
				<View>
					<Text style={homeStyle.title}>
						Welcome to GAIA, {user?.name}!
					</Text>
					<Link href="/projects" style={homeStyle.link}>
						<Text style={homeStyle.linkText}>View Projects</Text>
					</Link>
					<Button
						title="Logout"
						onPress={() => {
							dispatch(logout());
						}}
					/>
				</View>
			) : (
				<>
					<Text style={homeStyle.title}>Welcome to GAIA</Text>
					<Link href="/auth/login" style={homeStyle.link}>
						<Text style={homeStyle.linkText}>Login</Text>
					</Link>
				</>
			)}
		</View>
	);
}
