import {
    GET_USER_LLM_MODELS_REQUEST, GET_USER_LLM_MODELS_SUCCESS, GET_USER_LLM_MODELS_FAILURE
} from "../../constants/chat_hub/user-llm-models.constant"

export const getUserLLMModelsReducer = (
    state = { loading: true, userLLMModels: [] },
    action
) => {
    switch (action.type) {
        case GET_USER_LLM_MODELS_REQUEST:
            return { ...state, loading: true };
        case GET_USER_LLM_MODELS_SUCCESS:
            return { ...state, loading: false, userLLMModels: action.payload.data.userLLMModels, nextCursor: action.payload.data.nextCursor, hasMore: action.payload.data.hasMore };
        case GET_USER_LLM_MODELS_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
}
