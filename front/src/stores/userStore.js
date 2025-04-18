import { defineStore } from "pinia";
import axios from "../assets/axios.js";
import { useRouter } from "vue-router";
import dayjs from "dayjs";
// import { io } from "socket.io-client";
// const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
const APIURL = import.meta.env.VITE_API_URL;
// export const socket = io(APISOCKETURL);
const router = useRouter();

export const useUserStore = defineStore("user", {
  state: () => ({
    _id: "",
    username: null,
    email: null,
    role: null,
    unreadMessages: 0,
    rooms: [],
    createdAt: null,
    csrfToken: "",
    avatar: "",
    banner: "",
    avatarLink: "",
    bannerLink: "",
    mfaStatus: null,
    friends: [],
  }),
  actions: {
    async fetchProfile() {
      const router = useRouter();
      try {
        const response = await axios.get("/api/auth/profile", {
          withCredentials: true,
          headers: {
            "x-csrf-token": this.csrfToken,
          },
        });
        this.username = response.data.user.username;
        this.email = response.data.user.email;
        this.role = response.data.user.role;
        this.unreadMessages = [];
        this.rooms = response.data.user.rooms;
        this.createdAt = dayjs(response.data.user.createdAt).format(
          "DD/MM/YYYY"
        );
        this._id = response.data.user._id;

        // Fetch user images
        const imagesResponse = await axios.get("/api/auth/user/images", {
          withCredentials: true,
          headers: {
            "x-csrf-token": this.csrfToken,
          },
        });
        this.avatar = imagesResponse.data.avatar;
        this.banner = imagesResponse.data.banner;
        this.avatarLink = `${APIURL}/api/auth/uploads/${imagesResponse.data.avatar}`;
        this.bannerLink = `${APIURL}/api/auth/uploads/${imagesResponse.data.banner}`;

        console.log("imagesResponse", imagesResponse.data);
        this.mfaStatus = response.data.user.mfaStatus;
        this.friends = response.data.user.friends;
        console.log("USER: ", response.data.user);
      } catch (error) {
        console.error("Erreur lors du fetchProfile : ", error);
        router.push("/");
      }
    },
    async login(username, password, mfa) {
      const router = useRouter();
      try {
        const response = await axios.post(
          "/api/auth/login",
          {
            username,
            password,
            mfa,
          },
          {
            headers: {
              "x-csrf-token": this.csrfToken,
            },
          }
        );
        if (response.status === 200) {
          const profile = await axios.get("/api/auth/profile", {
            withCredentials: true,
            headers: {
              "x-csrf-token": this.csrfToken,
            },
          });
          this.username = profile.data.user.username;
          this.email = profile.data.user.email;
          this.role = profile.data.user.role;
          this.unreadMessages = [];
          this.rooms = profile.data.user.rooms;
          this.createdAt = profile.data.user.createdAt;
          this.mfaStatus = profile.data.user.mfaStatus;
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
        await axios.put(`/api/auth/infosUpdate`, { email });
      } catch (error) {
        console.error("Erreur lors du changement d'email : ", error);
      }
    },
    async updateMfaStatus(username) {
      try {
        if (this.mfaStatus === true) {
          await axios.post("/api/auth/mfa/reset", { username });
          this.mfaStatus = false;
        } else if (this.mfaStatus === false) {
          const reponse = await axios.post("/api/auth/mfa/setup", { username });
          if (reponse.data.qrCode != null) {
            console.log("Qrcode is here");
          }
          this.mfaStatus = true;
          return reponse.data.qrCode;
        }
      } catch (error) {
        console.error("Erreur lors de l'update du mfa", error);
      }
    },

    async register(formData) {
      try {
        const response = await axios.post("/api/auth/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if (response.status === 201) {
          this.username = response.data.username;
          this.email = response.data.email;
          this.role = response.data.role;
          this.rooms = response.data.rooms;
          this._id = response.data._id;

          await this.fetchProfile();
        }
      } catch (error) {
        console.error("Erreur lors de la création du compte : ", error);
        throw error;
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
    async fetchProfileById(userId) {
      const router = useRouter();
      try {
        const response = await axios.post("/api/auth/profile", {
          userId,
        });
        console.log("response", response.data);
        return response.data;
      } catch (error) {
        console.error("Erreur lors du fetchProfile : ", error);
        router.push("/");
      }
    },
    setCsrfToken(token) {
      this._csrfToken = token;
    },
    getCsrfToken() {
      return this._csrfToken;
    },
    async fetchCsrfToken() {
      console.log("fetchCsrfToken");
      try {
        const response = await axios.get("/api/auth/csrf-token");
        console.log("response", response.data.csrfToken);
        this.csrfToken = response.data.csrfToken; // Stockez le token dans le store
      } catch (error) {
        console.error("Erreur lors de la récupération du token CSRF :", error);
      }
    },
  },

  getters: {
    getUsername(state) {
      return state.username;
    },
  },
});
