import { 
    GET_USER_LLM_MODELS_FAILURE, GET_USER_LLM_MODELS_REQUEST, GET_USER_LLM_MODELS_SUCCESS,
    LLM_MODEL_LIST_FAILURE, LLM_MODEL_LIST_REQUEST, LLM_MODEL_LIST_SUCCESS, 
    UPSERT_USER_LLM_MODEL_FAILURE, UPSERT_USER_LLM_MODEL_REQUEST, UPSERT_USER_LLM_MODEL_SUCCESS, 
    USER_DETAIL_FAIL, USER_DETAIL_REQUEST, USER_DETAIL_SUCCESS, 
    USER_LIST_FAIL, USER_LIST_REQUEST, USER_LIST_SUCCESS, 
    USER_MODEL_UPDATE_FAILURE, USER_MODEL_UPDATE_REQUEST, USER_MODEL_UPDATE_SUCCESS, 
    USER_SETTING_UPDATE_FAILURE, USER_SETTING_UPDATE_REQUEST, USER_SETTING_UPDATE_SUCCESS, 
    USER_UPDATE_FAIL, USER_UPDATE_REQUEST, USER_UPDATE_SUCCESS 
} from "../../constants/auth_service/user.constants";

export const userListReducer = (
    state = { loading: true, users: [] }, action) => {
    switch (action.type) {
        case USER_LIST_REQUEST:
            return { loading: true };
        case USER_LIST_SUCCESS:
            return { loading: false, users: action.payload.listAllUsers };
        case USER_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const userUpdateReducer = (
    state = {}, action) => {
    switch (action.type) {
        case USER_UPDATE_REQUEST:
            return { loading: true };
        case USER_UPDATE_SUCCESS:
            return { loading: false, success: true };
        case USER_UPDATE_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const userDetailReducer = (
    state = { loading: true }, action) => {
    switch (action.type) {
        case USER_DETAIL_REQUEST:
            return { loading: true };
        case USER_DETAIL_SUCCESS:
            return { loading: false, user: action.payload.getUserDetail };
        case USER_DETAIL_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const userSettingUpdateReducer = (
    state = {}, action) => {
    switch (action.type) {
        case USER_SETTING_UPDATE_REQUEST:
            return { loading: true };
        case USER_SETTING_UPDATE_SUCCESS:
            return { loading: false, userSetting: action.payload };
        case USER_SETTING_UPDATE_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const getAllLLMModelsReducer = (
    state = { }, action) => {
    switch (action.type) {
        case LLM_MODEL_LIST_REQUEST:
            return { loading: true };
        case LLM_MODEL_LIST_SUCCESS:
            return { loading: false, llmModelInfo: action.payload.llmModels };
        case LLM_MODEL_LIST_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const updateUserModelReducer = (
    state = {}, action) => {
    switch (action.type) {
        case USER_MODEL_UPDATE_REQUEST:
            return { loading: true };
        case USER_MODEL_UPDATE_SUCCESS:
            return { loading: false, success: true };
        case USER_MODEL_UPDATE_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const getUserLLMModelsReducer = (
    state = { loading: true, userLLMModels: [] }, action) => {
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

export const upsertUserLLMModelReducer = (
    state = {}, action) => {
    switch (action.type) {
        case UPSERT_USER_LLM_MODEL_REQUEST:
            return { loading: true };
        case UPSERT_USER_LLM_MODEL_SUCCESS:
            return { loading: false, success: true };
        case UPSERT_USER_LLM_MODEL_FAILURE:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
