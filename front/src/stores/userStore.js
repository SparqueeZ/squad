import { defineStore } from "pinia";
import axios from "../assets/axios.js";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
export const socket = io(APISOCKETURL);

export const useUserStore = defineStore("user", {
  state: () => ({
    username: null,
    email: null,
    role: null,
    unreadMessages: 0,
    rooms: [],
  }),
  actions: {
    async fetchProfile() {
      const router = useRouter();
      try {
        const response = await axios.get("/api/user/profile");
        this.username = response.data.general.username;
        this.email = response.data.general.email;
        this.role = response.data.general.role;
        this.unreadMessages = response.data.general.unreadMessages;
        this.rooms = response.data.rooms;
        console.log(this.rooms);
      } catch (error) {
        console.error("Erreur lors du fetchProfile : ", error);
        router.push("/");
      }
    },
    async login(username, password) {
      const router = useRouter();
      try {
        const response = await axios.post("/api/auth/login", {
          username,
          password,
        });
        if (response.status === 200) {
          const token = response.data.token;
          const profile = await axios.get("/api/user/profile");
          this.username = profile.data.general.username;
          this.email = profile.data.general.email;
          this.role = profile.data.general.role;
          this.unreadMessages = profile.data.general.unreadMessages;
          this.rooms = profile.data.rooms;
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
        await axios.post(`/api/user/messages/viewed/`, {
          messageId,
        });
      } catch (error) {
        console.error("Erreur lors de l'updateMessageViews : ", error);
      }
    },
    async updateLastMessageOfRoom(message, roomId) {
      this.rooms.forEach((room) => {
        if (room.data.id === roomId) {
          room.lastMessages.unshift(message);
          console.warn(room.lastMessages);
        }
      });
    },
  },
  getters: {
    getUsername(state) {
      return state.username;
    },
  },
});
