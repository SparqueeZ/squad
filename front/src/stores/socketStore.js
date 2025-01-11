import { reactive } from "vue";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_SOCKET_URL);

const state = reactive({
  connected: false,
  messages: [],
});

socket.on("connect", () => {
  state.connected = true;
});

socket.on("disconnect", () => {
  state.connected = false;
});

socket.on("message", (message) => {
  state.messages.push(message);
});

const sendMessage = (message) => {
  socket.emit("message", message);
};

export default {
  state,
  sendMessage,
};
