import { defineStore } from "pinia";
import axios from "../assets/axios.js";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
// import { io } from "socket.io-client";
// const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
// export const socket = io(APISOCKETURL);
const router = useRouter();

export const useUserStore = defineStore("user", {
  state: () => ({
    username: null,
    email: null,
    role: null,
    unreadMessages: 0,
    rooms: [],
    createdAt : null,
    csrfToken: "",
    _id: "",
  }),
  actions: {
    async fetchProfile() {
      const router = useRouter();
      try {
        const csrfToken = getCsrfToken();
        const response = await axios.get("/api/auth/profile", {
          withCredentials: true,
          headers: {
            "x-csrf-token": csrfToken,
          },
        });
        this.username = response.data.user.username;
        this.email = response.data.user.email;
        this.role = response.data.user.role;
        this.unreadMessages = [];
        this.rooms = response.data.user.rooms;
        this.createdAt = dayjs(response.data.user.createdAt).format("DD/MM/YYYY");
        this._id = response.data.user._id;
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
          const csrfToken = getCsrfToken();

          const profile = await axios.get("/api/auth/profile", {
            withCredentials: true,
            headers: {
              "x-csrf-token": csrfToken,
            },
          });
          this.username = profile.data.user.username;
          this.email = profile.data.user.email;
          this.role = profile.data.user.role;
          this.unreadMessages = [];
          this.rooms = profile.data.user.rooms;
          this.createdAt = profile.data.user.createdAt;
          // this.csrfToken = csrfToken;
          this._id = profile.data.user._id;

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
    async updateEmail(email) {
      try {
        await axios.put(`/api/auth/infosUpdate`, {email});
      } catch (error) {
        console.error("Erreur lors du changement d'email : ", error);
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
        console.log(room._id, roomId);
        if (room._id === roomId) {
          room.messages.unshift(message);
          console.warn(room.messages.at(-1));
        }
      });
    },
    addMessageToRoom(message, roomId) {
      this.rooms.forEach((room) => {
        if (room._id === roomId) {
          room.messages.push(message);
        }
      });
    },
    async logout() {
      try {
        await axios.get("/api/auth/logout");
        this.username = null;
        this.email = null;
        this.role = null;
        this.unreadMessages = 0;
        this.rooms = [];
        this.createdAt = null;
      } catch (error) {
        console.error("Erreur lors du logout : ", error);
      }
    },
  },
  getters: {
    getUsername(state) {
      return state.username;
    },
  },
});

const getCsrfToken = () => {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf_token="))
    ?.split("=")[1];
};
