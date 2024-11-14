import { defineStore } from "pinia";
import axios from "../assets/axios";
import { io } from "socket.io-client";
const APIURL = import.meta.env.VITE_API_URL;
export const socket = io(APIURL);

export const useRoomStore = defineStore("room", {
  state: () => ({
    roomList: [],
    actual: {},
    lastMessage: {},
  }),
  actions: {
    fetchUsername() {
      this.username = localStorage.getItem("username");
      // console.log(this.username);
    },
    async fetchRoomList() {
      try {
        const response = await axios.get("/api/users/rooms");
        this.roomList = response.data;
        console.log("RoomList : ", this.roomList);
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    async fetchRoomById(roomId) {
      try {
        const response = await axios.get(`/api/rooms/byId/${roomId}`);
        this.actual = response.data;
        console.log(this.actual);
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    async fetchPrivateDiscussion(actualUser, destUser) {
      try {
        const response = await axios.post(`/api/rooms/private`, {
          title: "Conversation privée",
          description: "Une conversation privée",
          category: "private",
          private: true,
          users: ["60f9b7f7c5f4f7a5f4a5e7f8", "60f9b7f7c5f4f7a5f4a5e7f9"],
        });
        this.actual = response.data;
        console.log(this.actual);
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    setLastMessage(message) {
      const room = this.roomList.forEach((r) => {
        if (r.room._id === message.roomId) {
          r.lastMessage = message;
        }
      });
    },
  },
  getters: {
    getRoomList(state) {
      return state.roomList;
    },
  },
});
