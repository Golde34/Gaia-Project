import { HttpMethods, serverRequest } from "../../../baseAPI";
import { 
    MICROSERVICE_LIST_FAIL, MICROSERVICE_LIST_REQUEST, MICROSERVICE_LIST_SUCCESS, 
    SCREEN_LIST_FAIL, SCREEN_LIST_REQUEST, SCREEN_LIST_SUCCESS 
} from "../../constants/middleware_loader/microservices.constants";

const portName = {
    middlewarePort: "middlewarePort"
}

export const getMicroservices = () => async (dispatch) => {
    dispatch({ type: MICROSERVICE_LIST_REQUEST });
    try {
        // const headers = addAuthHeaders();
        const { data } = await serverRequest('/microservice/all', HttpMethods.GET, portName.middlewarePort, null);
        dispatch({ type: MICROSERVICE_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: MICROSERVICE_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        });
    }
}

export const getScreenConfiguration = () => async (dispatch) => {
    dispatch({ type: SCREEN_LIST_REQUEST });
    try {
        const { data } = await serverRequest('/microservice/gaia-screens', HttpMethods.GET, portName.middlewarePort, null);
        console.log(data)
        dispatch({ type: SCREEN_LIST_SUCCESS, payload: data.data });
    } catch (error) {
        dispatch({
            type: SCREEN_LIST_FAIL,
            payload: error.response && error.response.data.message
                ? error.response.data.message
                : error.message,
        })
    }
}