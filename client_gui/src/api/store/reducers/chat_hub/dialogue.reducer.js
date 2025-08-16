import { 
    GET_ALL_DIALOGUES_FAILURE, GET_ALL_DIALOGUES_REQUEST, GET_ALL_DIALOGUES_SUCCESS 
} from "../../constants/chat_hub/dialogue.constant"

export const getAllDialoguesReducer = (
    state = { loading: true, dialogues: [] },
    action
) => {
    switch (action.type) {
        case GET_ALL_DIALOGUES_REQUEST:
            return { ...state, loading: true };
        case GET_ALL_DIALOGUES_SUCCESS:
            return { ...state, loading: false, dialogues: action.payload.data.dialogues, nextCursor: action.payload.data.nextCursor, hasMore: action.payload.data.hasMore };
        case GET_ALL_DIALOGUES_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
