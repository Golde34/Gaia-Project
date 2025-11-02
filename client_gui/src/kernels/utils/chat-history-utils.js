export const buildChatHistoryKey = (dialogueId = "", chatType = "") => {
	const normalizedDialogueId = dialogueId && `${dialogueId}`.trim() !== "" ? `${dialogueId}` : "default";
	const normalizedChatType = chatType && `${chatType}`.trim() !== "" ? `${chatType}` : "default";
	return `${normalizedChatType}::${normalizedDialogueId}`;
};

export const defaultChatHistoryState = Object.freeze({
	loading: true,
	error: null,
	chatMessages: [],
	nextCursor: "",
	hasMore: false,
});
