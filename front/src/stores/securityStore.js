import { defineStore } from "pinia";
import axios from "../assets/axios";

export const useSecurityStore = defineStore("security", {
  state: () => ({
    csrfToken: "",
  }),
  actions: {
    async fetchCsrfToken() {
      const response = await axios.get("/csrf-token", {
        credentials: "include",
      });
      const data = await response;
      console.log(data);
      this.csrfToken = data.csrfToken;
    },
  },
  getters: {
    getChatList(state) {
      return state.chatList;
    },
  },
});
