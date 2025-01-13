import { defineStore } from "pinia";
import axios from "../assets/axios";

export const useChatStore = defineStore("chat", {
  state: () => ({
    chatList: [],
    users: [],
  }),
  actions: {
    async fetchChatListByRoomId(roomId) {
      try {
        const response = await axios.get(`/api/chat/${roomId}`);
        const room = await fetchRoomById(roomId);
        for (const user of room.users) {
          const newUser = {
            _id: user,
            avatar: await getUserImages(user),
          };
          this.users.push(newUser);
        }
        this.chatList = response.data;
        console.log("ChatList : ", this.chatList);
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

const getUserImages = async (users) => {
  let usersWithImages = [];
  for (const user of users) {
    const response = await axios.post(`/api/auth/user/images/`, {
      userId: user,
    });
    return response.data.avatar;
  }
  return usersWithImages;
};

const fetchRoomById = async (roomId) => {
  try {
    const response = await axios.get(`/api/chat/room/${roomId}`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du fetchAllCourses : ", error);
  }
};
