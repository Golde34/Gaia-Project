import { colors, sizes } from '@/src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ReturnButtonProps = {
	onPress?: () => void;
};

const ReturnButton: React.FC<ReturnButtonProps> = ({ onPress }) => (
	<View style={styles.container}>
		<TouchableOpacity onPress={onPress} style={styles.button} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
			<Ionicons name="arrow-back" size={sizes.large} color={colors.light} />
		</TouchableOpacity>
	</View>
);

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		top: "5%",
		left: sizes.medium,
		zIndex: 10,
	},
	button: {
		padding: 8,
		borderRadius: sizes.small,
		backgroundColor: colors.black,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default ReturnButton;