import { defineStore } from "pinia";
import axios from "../assets/axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    chatList: [],
  }),
  actions: {
    async fetchChatListByRoomId(roomId) {
      try {
        const response = await axios.get(`/api/chat/${roomId}`);
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
