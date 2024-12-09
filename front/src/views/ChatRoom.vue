<template>
  <div class="chat-room">
    <!-- <canvas id="canvas"></canvas> -->
    <div class="message-header">
      <div class="chat-infos">
        <h1 class="chat-title" v-if="room.actual.room">
          Room {{ room.actual.room.title }}
        </h1>
        <p class="chat-description"></p>
      </div>
    </div>
    <div class="messages" ref="messagesContainer">
      <div
        v-for="message in chat.chatList"
        :key="message._id"
        :id="message._id"
        class="message"
        :class="user.username === message.sender ? 'sender' : ''"
      >
        <div class="message-sender-img" @click="console.log('Open DM')"></div>
        <div class="message-bubble">
          <div class="message-sender">
            <Icon v-if="user.role === 'admin'" name="crown" />
            <p>{{ message.sender }}</p>
          </div>
          <p class="message-content">{{ message.text }}</p>
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
    <div class="input-bar" @dragover.prevent @drop="handleFileDrop">
      <Icon name="attachment" />
      <form @submit.prevent="sendMessage">
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
    <div v-if="file" class="file-upload-message">
      <p>File ready to upload: {{ file.name }}</p>
      <button @click="uploadFile">Upload</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { io } from "socket.io-client";
import Icon from "@/components/lib/Icon.vue";
import { useRoute } from "vue-router";
import { triggerConfetti } from "@/assets/lib/Confetti";
import axios from "../assets/axios";

const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
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

const messagesContainer = ref(null);
const canvas = ref(null);
const file = ref(null);

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
      sender: user.username,
      timestamp: getActualDateTime(),
      roomId: route.params.id,
      viewedBy: ["Baptiste"],
    };
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

const handleFileDrop = (event) => {
  event.preventDefault();
  const droppedFile = event.dataTransfer.files[0];
  if (droppedFile) {
    file.value = droppedFile;
    console.log("File dropped:", droppedFile.name);
  }
};

const handleFileUploadResponse = (response) => {
  console.log(`Fichier uploadé : ${response.data.path}`);
  file.value = null; // Clear the file after successful upload
};

const uploadFile = async () => {
  if (!file.value) return;

  const formData = new FormData();
  formData.append("file", file.value);

  try {
    const response = await axios.post("/api/chat/room/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    handleFileUploadResponse(response);
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  canvas.value = document.getElementById("canvas");
  console.log(user.rooms);
  user.rooms.forEach((r) => {
    socket.emit("joinRoom", user.username, r.data.id);
  });
  socket.on("receiveMessage", (message) => {
    if (message.text.includes("Joyeux anniversaire")) {
      triggerConfetti(canvas.value, 5000);
    }
    chat.chatList.push(message);
    user.updateLastMessageOfRoom(message, message.roomId);
    scrollToBottom();
  });
  socket.on("isTyping", (userData) => {
    if (!someoneIsTyping.value.includes(userData)) {
      someoneIsTyping.value.push(userData);
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
    room.fetchRoomById(route.params.id);
    chat.fetchChatListByRoomId(route.params.id);
  }

  setTimeout(() => {
    scrollToBottom();
  }, 100);
  messagesContainer.value.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  messagesContainer.value.removeEventListener("scroll", handleScroll);
  socket.off("receiveMessage");
});

watch(
  () => route.params.id,
  (newId) => {
    if (route.params.id) {
      chat.fetchChatListByRoomId(newId);
      room.fetchRoomById(newId);
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
    .chat-title {
      font-size: 1.5rem;
      color: #fff;
    }
    .chat-description {
      font-size: 0.9rem;
      color: #a9aeba;
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
        }
      }
      // border-bottom: 1px solid #ccc;
      .message-sender-img {
        width: 50px;
        flex-shrink: 0;
        height: 50px;
        background-color: #333;
        border-radius: 20%;
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
        }
        .message-infos {
          color: #676769;
          margin-top: 0.5rem;
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
