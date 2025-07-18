import { HttpMethods, serverRequest } from "../../../baseAPI";
import { config } from "../../../kernels/configs/configuration";
import {
  GET_CHAT_HISTORY_FAILURE,
  GET_CHAT_HISTORY_REQUEST,
  GET_CHAT_HISTORY_SUCCESS,
  SEND_CHAT_MESSAGE_REQUEST,
  SEND_CHAT_MESSAGE_SUCCESS,
  SEND_CHAT_MESSAGE_FAIL,
} from "../../constants/chat_hub/messages.constant";

const portName = {
  chatHubPort: "chatHubPort",
};

export const getChatHistory = () => async (dispatch) => {
  dispatch({ type: GET_CHAT_HISTORY_REQUEST });
  try {
    const { data } = await serverRequest(
      `/chat-history`,
      HttpMethods.GET,
      portName.chatHubPort,
    );
    dispatch({ type: GET_CHAT_HISTORY_SUCCESS, payload: data.data });
  } catch (error) {
    dispatch({
      type: GET_CHAT_HISTORY_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

export const sendChatMessage =
  (dialogueId, message, chatType) => async (dispatch) => {
    dispatch({ type: SEND_CHAT_MESSAGE_REQUEST });
    try {
      const url = `http://${config.serverHost}:${config.chatHubPort}/chat?dialogueId=${dialogueId}&message=${encodeURIComponent(message)}&type=${chatType}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        dispatch({ type: SEND_CHAT_MESSAGE_SUCCESS, payload: event.data });
        eventSource.close();
      };

      eventSource.onerror = () => {
        dispatch({
          type: SEND_CHAT_MESSAGE_FAIL,
          payload: "SSE connection error",
        });
        eventSource.close();
      };
    } catch (error) {
      dispatch({
        type: SEND_CHAT_MESSAGE_FAIL,
        payload: error.message,
      });
    }
  };
