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
    messages: [],
    users: [],
    roomId: "",
  }),
  actions: {
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
        this.roomId = roomId;
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    async fetchChatListByRoomId(roomId) {
      try {
        const response = await axios.get(`/api/chat/${roomId}`);
        const room = await fetchRoomById(roomId);
        for (const user of room.users) {
          const newUser = {
            _id: user.userId,
            avatar: await getUserImages(user.userId),
          };
          console.log(newUser);
          this.users.push(newUser);
        }
        response.data.forEach((message) => {
          this.users.forEach(async (user) => {
            if (user._id === message.sender._id) {
              if (!user.avatar) {
                message.sender.avatar = await getUserImages(user._id);
              }
              message.sender.avatar = user.avatar;
            }
          });
        });
        this.messages = response.data;
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
        console.log(this.actual);
        this.actual = response.data;
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    async createPrivateRoom(title, description, category, users) {
      try {
        const response = await axios.post(`/api/chat/room/private`, {
          title,
          description,
          category,
          private: true,
          users,
        });
        if (response.status === 200) {
          console.log(response.data);
          if (response.data.message === "Private room already exists") {
            console.log("Room already exists");
            return response.data.existingRoom._id;
          }
        }
      } catch (error) {
        console.error("Erreur lors du fetchAllCourses : ", error);
      }
    },
    addMessageToRoom(message, roomId) {
      if (roomId === this.actual._id) {
        this.users.forEach(async (user) => {
          if (user._id === message.sender._id) {
            if (!user.avatar) {
              message.sender.avatar = await getUserImages(user._id);
            }
            message.sender.avatar = user.avatar;
          }
        });
      }
      this.messages.push(message);
    },
    setActualRoom(room) {
      this.actual = room;
    },
  },
  getters: {
    getRoomList(state) {
      return state.roomList;
    },
  },
});

const getUserImages = async (user) => {
  const response = await axios.post(`/api/auth/user/images/`, {
    userId: user,
  });
  return response.data.avatar;
};

const fetchRoomById = async (roomId) => {
  try {
    const response = await axios.get(`/api/chat/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du fetchAllCourses : ", error);
  }
};
