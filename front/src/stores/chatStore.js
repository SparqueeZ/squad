import { defineStore } from "pinia";
import axios from "../assets/axios";
import { io } from "socket.io-client";

const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
export const socket = io(APISOCKETURL);

export const useChatStore = defineStore("chat", {
  state: () => ({
    chatList: [],
  }),
  actions: {
    fetchUsername() {
      this.username = localStorage.getItem("username");
      // console.log(this.username);
    },
    async fetchChatListByRoomId(roomId) {
      socket.emit("joinRoom", roomId);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/chat/${roomId}`
        );
        this.chatList = response.data;
        console.log(this.chatList);
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
  },
  getters: {
    getChatList(state) {
      return state.chatList;
    },
  },
});
