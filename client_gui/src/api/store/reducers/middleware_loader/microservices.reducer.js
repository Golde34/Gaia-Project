import { 
    MICROSERVICE_LIST_FAIL, MICROSERVICE_LIST_REQUEST, MICROSERVICE_LIST_SUCCESS, 
    SCREEN_LIST_FAIL, SCREEN_LIST_REQUEST, SCREEN_LIST_SUCCESS 
} from "../../constants/middleware_loader/microservices.constants";

export const microserviceListReducer = (
    state = { loading: true, microservices: [] },
    action) => {
    switch (action.type) {
        case MICROSERVICE_LIST_REQUEST:
            return { loading: true };
        case MICROSERVICE_LIST_SUCCESS:
            return { loading: false, microservices: action.payload };
        case MICROSERVICE_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}

export const screenListReducer = (
    state = { loading: true, screens: [] },
    action) => {
    switch (action.type) {
        case SCREEN_LIST_REQUEST:
            return { loading: true };
        case SCREEN_LIST_SUCCESS:
            return { loading: false, screens: action.payload };
        case SCREEN_LIST_FAIL:
            return { loading: false, error: action.payload };
        default:
            return state;
    }
}
