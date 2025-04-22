import { 
    LLM_MODEL_LIST_FAILURE, LLM_MODEL_LIST_REQUEST, LLM_MODEL_LIST_SUCCESS, 
    USER_DETAIL_FAIL, USER_DETAIL_REQUEST, USER_DETAIL_SUCCESS, 
    USER_LIST_FAIL, USER_LIST_REQUEST, USER_LIST_SUCCESS, 
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
