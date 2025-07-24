import { config } from "../../../../kernels/configs/configuration";
import { HttpMethods, serverRequest } from "../../../baseAPI";
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

export const getChatHistory = (size, cursor, dialogueId, chatType) => async (dispatch) => {
  dispatch({ type: GET_CHAT_HISTORY_REQUEST });
  try {
    const cursorParam = cursor ? `&cursor=${encodeURIComponent(cursor)}` : '';
    const { data } = await serverRequest(
      `/chat-history?size=${size}${cursorParam}&dialogueId=${dialogueId}&chatType=${chatType}`,
      HttpMethods.GET,
      portName.chatHubPort,
    );
    console.log("Chat history fetched: ", data);
    dispatch({ type: GET_CHAT_HISTORY_SUCCESS, payload: data });
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

export const sendChatMessage = async (dialogueId, message, chatType) => {
  try {
    const tokenResponse = await serverRequest(`/chat/initiate-chat`, HttpMethods.POST, portName.chatHubPort);
    if (tokenResponse.status !== 200) {
      throw new Error("Failed to initiate chat");
    }
    if (!tokenResponse.data) {
      throw new Error("SSE token not received");
    }

    const params = new URLSearchParams({
      dialogueId: dialogueId,
      message: message,
      type: chatType,
      sseToken: tokenResponse.data,
    });
    const baseUrl = `http://${config.serverHost}:${config.chatHubPort}`;
    const url = `${baseUrl}/chat/send-message?${params}`;

    return new Promise((resolve, reject) => {
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        eventSource.close();
        const response = event.data;
        resolve(response);
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        reject(new Error("EventSource error"));
      };
    });
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};