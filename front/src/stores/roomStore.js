import { defineStore } from "pinia";
import axios from "../assets/axios";
// import { io } from "socket.io-client";
// const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
// export const socket = io(APISOCKETURL);

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
        const response = await axios.get("/api/user/rooms");
        this.roomList = response.data;
        console.log("RoomList : ", this.roomList);
      } catch (error) {
        console.error("Erreur lors du fetchRoomList : ", error);
      }
    },
    async fetchRoomById(roomId) {
      try {
        const response = await axios.get(`/api/chat/room/${roomId}`);
        this.actual = response.data;
        // console.log(this.actual);
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
      // console.log(this.roomList);
      // console.log(this.actual);
      // const room = this.roomList.forEach((r) => {
      //   console.log(r);
      //   // if (r.room.id === message.roomId) {
      //   //   r.lastMessage = message;
      //   // }
      // });
    },
  },
  getters: {
    getRoomList(state) {
      return state.roomList;
    },
  },
});
