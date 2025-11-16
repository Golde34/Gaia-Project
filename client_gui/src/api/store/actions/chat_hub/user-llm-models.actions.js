import { GET_ALL_DIALOGUES_REQUEST } from "../../constants/chat_hub/dialogue.constant";
import { GET_USER_LLM_MODELS_REQUEST } from "../../constants/chat_hub/user-llm-models.constant";

const portName = {
    chatHubPort: "chatHubPort"
}

export const getUserLLMModels = () => async (dispatch) => {
    dispatch({ type: GET_USER_LLM_MODELS_REQUEST });
    try {
        const { data } = await serverRequest(
            `/user/llm-models`,
            HttpMethods.GET,
            portName.chatHubPort,
        );
        dispatch({ type: GET_ALL_DIALOGUES_REQUEST, payload: data });
    } catch (error) {
        dispatch({
            type: GET_USER_LLM_MODELS_REQUEST,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
}

export const upsertUserLLMModel = (modelData) => async (dispatch) => {
    dispatch({ type: UPSERT_USER_LLM_MODEL_REQUEST });
    try {
        const { data } = await serverRequest(
            `/user/llm-models`,
            HttpMethods.POST,
            portName.chatHubPort,
            modelData
        );
        dispatch({ type: UPSERT_USER_LLM_MODEL_SUCCESS, payload: data });
    } catch (error) {
        dispatch({
            type: UPSERT_USER_LLM_MODEL_FAILURE,
            payload:
                error.response && error.response.data.message
                    ? error.response.data.message
                    : error.message,
        });
    }
};
