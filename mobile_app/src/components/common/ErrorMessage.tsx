import React from "react";

const ErrorMessage: React.FC<{ error: string }> = ({ error }) => {
	return (
		<div style={styles.errorContainer}>
			<p style={styles.errorText}>{error}</p>
		</div>
	);
}

const styles = {
	errorContainer: {
		backgroundColor: "#f8d7da",
		borderColor: "#f5c6cb",
		borderWidth: 1,
		borderRadius: 4,
		padding: 10,
		marginVertical: 10,
	},
	errorText: {
		color: "#721c24",
		fontSize: 16,
	},
};

export default ErrorMessage;