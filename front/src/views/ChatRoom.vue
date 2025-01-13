<template>
  <div class="chat-room">
    <!-- <canvas id="canvas"></canvas> -->
    <div class="message-header">
      <div class="chat-infos">
        <div class="room-infos">
          <h1 class="chat-title" v-if="room.actual">
            {{ room.actual.title }}
          </h1>
          <p class="chat-description">{{ room.actual.description }}</p>
        </div>
        <div class="room-users">
          <div class="users">
            <div v-for="user in room.actual.users" :key="user._id" class="user">
              <img
                :src="`${APIURL}/api/auth/uploads/${user.avatar}`"
                alt=""
                srcset=""
              />
            </div>
          </div>
          <button @click="openProfilePopup()">Invite a friend</button>
        </div>
      </div>
    </div>
    <div class="messages" ref="messagesContainer">
      <div
        v-for="message in room.messages"
        :key="message._id"
        :id="message._id"
        class="message"
        :class="user.username === message.sender.username ? 'sender' : ''"
      >
        <div
          class="message-sender-img"
          @click="openProfile(message.sender._id)"
        >
          <img
            :src="`${APIURL}/api/auth/uploads/${message.sender.avatar}`"
            alt=""
            srcset=""
          />
        </div>
        <div class="message-bubble">
          <div class="message-sender">
            <p>{{ message.sender.username }}</p>
          </div>
          <p class="message-content">
            {{ message.filePath ? "" : message.text }}
          </p>
          <div v-if="message.filePath" class="message-content">
            <a
              v-if="message.filePath"
              @click="downloadFile(message.filePath, message.fileName)"
            >
              <img
                :src="`${APIURL}/api/chat${message.filePath}`"
                alt=""
                srcset=""
              />
            </a>
          </div>
          <div class="message-infos">
            <p class="message-date">
              {{ getDateString(message.timestamp) }}
            </p>
            <div class="message-views-counter">
              <p>
                {{
                  message.viewedBy.length - 1 ? message.viewedBy.length - 1 : ""
                }}
              </p>
              <Icon v-if="message.viewedBy.length - 1" name="eye" />
            </div>
          </div>
        </div>
      </div>
      <div
        class="message-typing-bubble"
        v-if="
          someoneIsTyping.length > 0 && !someoneIsTyping.includes(user.username)
        "
      >
        <p></p>
        <div class="dot-falling"></div>
      </div>
    </div>

    <div v-if="file" class="file-upload-message">
      <p>File ready to upload: {{ file.name }}</p>
      <button @click="uploadFile">Upload</button>
    </div>
    <div class="input-bar" @dragover.prevent @drop="handleFileDrop">
      <Icon name="attachment" />
      <form @submit.prevent="file ? uploadFile() : sendMessage()">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Votre message"
          required
          @keyup="handleIsTyping()"
          @blur="stopTyping()"
          @click="startTyping()"
        />

        <button type="submit">Envoyer</button>
      </form>
      <Icon name="microphone" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import Icon from "@/components/lib/Icon.vue";
import { useRoute } from "vue-router";
import { triggerConfetti } from "@/assets/lib/Confetti";
import axios from "../assets/axios";
import { usePopupStore } from "@/stores/popupStore";
const router = useRouter();

const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
const APIURL = import.meta.env.VITE_API_URL;
const socket = io(APISOCKETURL);
const newMessage = ref("");
import { useUserStore } from "@/stores/userStore";
import { useChatStore } from "@/stores/chatStore";
import { useRoomStore } from "@/stores/roomStore";

const room = useRoomStore();
const chat = useChatStore();
const user = useUserStore();
const route = useRoute();
const someoneIsTyping = ref([]);

import ProfileView from "./ProfileView.vue";
import invitePopup from "@/components/invitePopup.vue";
// import Settings from "@/components/Settings.vue";

// Store
const popupStore = usePopupStore();

// Méthodes pour ouvrir la popup avec différents contenus
const openProfilePopup = () => {
  popupStore.openPopup(invitePopup);
};

// const openSettingsPopup = () => {
//   popupStore.openPopup(Settings);
// };

const messagesContainer = ref(null);
const canvas = ref(null);
const file = ref(null);

const openPopup = () => {
  popup.togglePopup();
};

const openProfile = (userId) => {
  router.push(`/profile/${userId}`);
};

const handleIsTyping = () => {
  // if (newMessage.value) {
  //   socket.emit("isTyping", room.actual.room._id, user.username);
  // } else {
  //   socket.emit("stoppedTyping", room.actual.room._id, user.username);
  // }
};

const sendMessage = () => {
  // if (newMessage.value === "HB") {
  //   triggerConfetti(canvas.value, 5000); // Specify duration in milliseconds
  // }
  if (
    newMessage.value &&
    newMessage.value.trim() !== "" &&
    newMessage.value.length > 0 &&
    newMessage.value.length < 1000
  ) {
    const message = {
      text: newMessage.value,
      sender: {
        username: user.username,
        _id: user._id,
        avatar: user.avatar ? user.avatar : "",
      },
      timestamp: getActualDateTime(),
      roomId: route.params.id,
      viewedBy: ["Baptiste"],
    };
    console.log("Message envoyé :", message);
    const data = {
      room: route.params.id,
      message: message,
    };
    socket.emit("sendMessage", data);
    newMessage.value = "";
    scrollToBottom();
  }
};

const getActualDateTime = () => {
  let date = new Date();
  return date.toISOString();
};

const getDateString = (datetime) => {
  let date = new Date(datetime);

  let options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  let formattedTime = new Intl.DateTimeFormat("fr-FR", options).format(date);
  return formattedTime;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const stopTyping = () => {
  // socket.emit("stoppedTyping", room.actual.room._id, user.username);
};

const startTyping = () => {
  // chat.chatList.forEach((message) => {
  //   if (message.sender !== user.username) {
  //     if (!message.viewedBy.includes(user.username)) {
  //       socket.emit(
  //         "messageViewed",
  //         room.actual.room._id,
  //         message._id,
  //         user.username
  //       );
  //       message.viewedBy.push(user.username);
  //     }
  //   }
  // });
  // if (newMessage.value)
  //   socket.emit("isTyping", room.actual.room._id, user.username);
};

const handleScroll = () => {
  // const container = messagesContainer.value;
  // const containerTop = container.scrollTop;
  // const containerBottom = containerTop + container.clientHeight;
  // chat.chatList.forEach((message) => {
  //   const messageElement = document.getElementById(message._id);
  //   if (messageElement) {
  //     const messageTop = messageElement.offsetTop;
  //     const messageBottom = messageTop + messageElement.clientHeight;
  //     if (messageTop >= containerTop && messageBottom <= containerBottom) {
  //       if (!message.viewedBy.includes(user.username)) {
  //         socket.emit(
  //           "messageViewed",
  //           room.actual.room._id,
  //           message._id,
  //           user.username
  //         );
  //         message.viewedBy.push(user.username);
  //       }
  //     }
  //   }
  // });
};

const createPrivateRoom = async (senderId) => {
  if (!senderId) return;
  if (user._id === senderId) {
    console.warn(
      "Vous essayez de vous envoyer un message. privé, cela n'est pas possible"
    );
    return;
  }
  const response = await room.createPrivateRoom(
    "Conversation",
    "Conversation privée entre 2 utilsateurs.",
    "discussion",
    [senderId]
  );
  if (response) {
    console.log("Room created :", response);
    router.push(`/${response}`);
  }
};

const handleFileDrop = (event) => {
  event.preventDefault();
  const droppedFile = event.dataTransfer.files[0];
  if (droppedFile) {
    file.value = droppedFile;
    newMessage.value = "Fichier ";
    console.log("File dropped:", droppedFile.name);
  }
};

const uploadFile = async () => {
  if (!file.value) return;

  const formData = new FormData();
  formData.append("file", file.value);
  formData.append("roomId", route.params.id);
  formData.append(
    "sender",
    JSON.stringify({ username: user.username, _id: user._id })
  );

  try {
    const response = await axios.post("/api/chat/room/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    socket.emit("fileUploaded", {
      response,
    });

    file.value = null;
    newMessage.value = "";
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};

const downloadFile = async (filePath, fileName) => {
  filePath = filePath.replace("uploads/", "");
  try {
    const response = await axios.get(`/api/chat/room/files/${filePath}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

onMounted(() => {
  canvas.value = document.getElementById("canvas");
  user.rooms.forEach((r) => {
    socket.emit("joinRoom", user.username, r._id);
  });
  socket.on("receiveMessage", (message) => {
    if (message.text.includes("Joyeux anniversaire")) {
      triggerConfetti(canvas.value, 5000);
    }
    console.log("Message reçu :", message);
    user.addMessageToRoom(message, message.roomId);
    room.addMessageToRoom(message, message.roomId);
    scrollToBottom();
  });
  socket.on("isTyping", (userData) => {
    if (!someoneIsTyping.value.includes(userData)) {
      someoneIsTyping.value.push(userData);
    }
  });

  socket.on("fileUploaded", (data) => {
    if (data.type === "file") {
      console.log(`Fichier reçu : ${data.fileName}`);
      chat.chatList.push({
        text: `Fichier reçu : ${data.fileName}`,
        filePath: data.filePath,
        fileName: data.fileName,
        sender: data.sender,
        timestamp: getActualDateTime(),
        roomId: data.roomId,
        viewedBy: ["Baptiste"],
      });
    }
  });

  socket.on("stoppedTyping", (userData) => {
    const index = someoneIsTyping.value.findIndex((user) => user === userData);
    someoneIsTyping.value.splice(index, 1);
  });

  socket.on("messageViewed", (messageId, userData) => {
    const message = chat.chatList.find((message) => message._id === messageId);
    if (!message.viewedBy.includes(userData)) {
      message.viewedBy.push(userData);
    }
  });

  if (route.params.id) {
    // chat.fetchChatListByRoomId(route.params.id);
    room.fetchChatListByRoomId(route.params.id);
    const newRoom = user.rooms.find((r) => r._id === route.params.id);
    room.setActualRoom(newRoom);

    setTimeout(() => {
      scrollToBottom();
    }, 500);
  }

  messagesContainer.value.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  //messagesContainer.value.removeEventListener("scroll", handleScroll);
  socket.off("receiveMessage");
});

watch(
  () => route.params.id,
  async (newId) => {
    if (route.params.id) {
      await room.fetchChatListByRoomId(route.params.id);
      const newRoom = user.rooms.find((r) => r._id === newId);
      room.setActualRoom(newRoom);

      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }
);
</script>

<style scoped lang="scss">
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background-color: #202329;
  overflow: auto;
  canvas {
    position: absolute;
    pointer-events: none;
    overflow-y: hidden;
    overflow-x: hidden;
    width: 100%;
    margin: 0;
  }
  border-top-right-radius: 1rem;
  border-bottom-right-radius: 1rem;
  .chat-infos {
    padding: 1rem;
    border-bottom: 1px solid #333;
    display: flex;
    justify-content: space-between;
    .room-infos {
      display: flex;
      flex-direction: column;
      .chat-title {
        font-size: 1.5rem;
        color: #fff;
        margin: 0rem;
      }
      .chat-description {
        font-size: 0.9rem;
        color: #a9aeba;
      }
    }
    .room-users {
      display: flex;
      p {
        font-size: 0.9rem;
        color: #a9aeba;
        margin-bottom: 0.5rem;
      }
      .users {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        .user {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: #333;
          color: #fff;
          font-size: 0.8rem;
          border: 5px solid #202329;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
          }
        }
      }
    }
  }

  .messages {
    flex: 1;
    overflow-y: auto;

    .message {
      padding: 10px;
      display: flex;
      align-items: end;
      gap: 1rem;
      &.sender {
        // justify-content: flex-end;
        flex-direction: row-reverse;
        .message-bubble {
          justify-content: end;
          text-align: end;
          gap: 0.5rem;
        }
      }
      // border-bottom: 1px solid #ccc;
      .message-sender-img {
        width: 50px;
        flex-shrink: 0;
        height: 50px;
        background-color: #333;
        border-radius: 20%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .message-bubble {
        padding: 1rem 1rem 0.5rem 1rem;
        border-radius: 1rem;
        display: flex;
        max-width: 40%;
        min-width: 90px;
        flex-direction: column;
        background-color: #2e333d;
        .message-sender {
          display: flex;
          align-items: center;
          justify-content: start;
          color: #fff;
          gap: 0.2rem;
          .icon {
            width: 16px;
            height: 16px;
            fill: none;
          }
        }
        .message-content {
          font-size: 0.9rem;
          color: #a9aeba;
          overflow: hidden;
          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 10px;
            cursor: pointer;
          }
        }
        .message-infos {
          color: #676769;
          display: flex;
          flex-direction: row-reverse;
          gap: 0.2rem;
          font-size: 0.7rem;
          .message-date {
            color: #676769;
          }
          .message-views-counter {
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: 0.2s ease all;
            &:hover {
              color: #fff;
              .icon {
                stroke: #fff;
                color: #fff;
              }
            }
            .icon {
              display: flex;
              transition: 0.2s ease all;
              fill: transparent;
              flex-shrink: 0;
              stroke: #676769;
              color: #676769;
              width: 16px;
              height: 16px;
            }
          }
        }
      }
    }

    .message-typing-bubble {
      padding: 1rem;
      border-radius: 1rem;
      display: flex;
      width: fit-content;
      align-items: center;
      background-color: #2e333d;
      color: #fff;
      font-size: 0.8rem;
      .dot-falling {
        position: relative;
        margin: 0 1.3rem;
        left: -9999px;
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #676769;
        color: #676769;
        box-shadow: 9999px 0 0 0 #676769;
        animation: dot-falling 1s infinite linear;
        animation-delay: 0.1s;
      }
      .dot-falling::before,
      .dot-falling::after {
        content: "";
        display: inline-block;
        position: absolute;
        top: 0;
      }
      .dot-falling::before {
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #676769;
        color: #676769;
        animation: dot-falling-before 1s infinite linear;
        animation-delay: 0s;
      }
      .dot-falling::after {
        width: 10px;
        height: 10px;
        border-radius: 5px;
        background-color: #676769;
        color: #676769;
        animation: dot-falling-after 1s infinite linear;
        animation-delay: 0.2s;
      }

      @keyframes dot-falling {
        0% {
          box-shadow: 9999px -15px 0 0 rgba(152, 128, 255, 0);
        }
        25%,
        50%,
        75% {
          box-shadow: 9999px 0 0 0 #676769;
        }
        100% {
          box-shadow: 9999px 15px 0 0 rgba(152, 128, 255, 0);
        }
      }
      @keyframes dot-falling-before {
        0% {
          box-shadow: 9984px -15px 0 0 rgba(152, 128, 255, 0);
        }
        25%,
        50%,
        75% {
          box-shadow: 9984px 0 0 0 #676769;
        }
        100% {
          box-shadow: 9984px 15px 0 0 rgba(152, 128, 255, 0);
        }
      }
      @keyframes dot-falling-after {
        0% {
          box-shadow: 10014px -15px 0 0 rgba(152, 128, 255, 0);
        }
        25%,
        50%,
        75% {
          box-shadow: 10014px 0 0 0 #676769;
        }
        100% {
          box-shadow: 10014px 15px 0 0 rgba(152, 128, 255, 0);
        }
      }
    }
  }
  .input-bar {
    display: flex;
    padding: 1rem;
    gap: 1rem;
    width: calc(100% - 2rem);
    justify-content: center;
    input {
      width: 350px;
      flex: 1;
      padding: 1rem;
      border-radius: 10px;
      border: none;
      background-color: transparent;
      color: #fff;
      transition: all 0.3s ease;
      &:focus {
        outline: none;
        background-color: #2e333d;
      }
      &:hover {
        background-color: #2e333d;
      }
    }
    button {
      display: none;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      border: none;
      background-color: #2e333d;
      color: #fff;
      margin-left: 1rem;
      &:hover {
        background-color: #333;
      }
    }
    .icon {
      display: flex;
      align-items: center;
      fill: transparent;
      stroke: #fff;
      width: 20px;
      display: flex;
    }
  }
  .file-upload-message {
    background-color: #2e333d;
    color: #fff;
    padding: 1rem;
    border-radius: 10px;
    margin: 1rem 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    button {
      background-color: #333;
      color: #fff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      &:hover {
        background-color: #444;
      }
    }
  }
}
</style>
