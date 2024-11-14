import { defineStore } from "pinia";
import axios from "../assets/axios.js";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
const APIURL = import.meta.env.VITE_API_URL;
export const socket = io(APIURL);

export const useUserStore = defineStore("user", {
  state: () => ({
    username: null,
    email: null,
    role: null,
    unreadMessages: 0,
  }),
  actions: {
    async fetchProfile() {
      const router = useRouter();
      try {
        const response = await axios.get("/api/users/profile");
        this.username = response.data.username;
        this.email = response.data.email;
        this.role = response.data.role;
        this.unreadMessages = response.data.unreadMessages;
        console.log(this.unreadMessages);
      } catch (error) {
        console.error("Erreur lors du fetchProfile : ", error);
        router.push("/");
      }
    },
    async login(username, password) {
      const router = useRouter();
      try {
        const response = await axios.post("/api/users/login", {
          username,
          password,
        });
        if (response.status === 200) {
          const token = response.data.token;
          const profile = await axios.get("/api/users/profile");
          this.username = profile.data.username;
          this.email = profile.data.email;
          this.role = profile.data.role;
          this.unreadMessages = profile.data.unreadMessages;
          return true;
        } else {
          router.push("/login");
          return false;
        }
      } catch (error) {
        console.error("Erreur lors du login : ", error);
        router.push("/login");
      }
    },
    async updateMessageViews(messageId) {
      try {
        await axios.post(`/api/users/messages/viewed/`, {
          messageId,
        });
      } catch (error) {
        console.error("Erreur lors de l'updateMessageViews : ", error);
      }
    },
  },
  getters: {
    getUsername(state) {
      return state.username;
    },
  },
});
