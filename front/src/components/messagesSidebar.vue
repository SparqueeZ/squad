<template>
  <aside class="message-sidebar-container">
    <div class="message-sidebar">
      <div class="message-sidebar-header">
        <div class="message-searchbar">
          <Icon name="search" />
          <input type="text" placeholder="Search" />
        </div>
      </div>
      <div class="message-sidebar-body">
        <div
          class="message-card"
          v-for="(message, index) in messages"
          :key="index"
        >
          <div class="message-img"></div>
          <div class="message-body">
            <div class="message-top">
              <p class="message-sender">{{ message.sender }}</p>
              <div class="message-status">
                <Icon v-if="message.seen" name="tickdouble" />
                <p class="message-sended-timing">2m</p>
              </div>
            </div>
            <div class="message-btm">
              <p class="message-content">
                {{ message.content }}
              </p>
              <div class="message-status">
                <Icon v-if="message.pinned" name="pin" />
              </div>
            </div>
          </div>
        </div>
        <router-link
          v-for="(r, index) in user.rooms"
          :key="index"
          :id="`room-${index}`"
          :to="`/${r.data.id}`"
        >
          <div class="message-card">
            <div class="message-img"></div>
            <div class="message-body">
              <div class="message-top">
                <div class="message-sender">{{ r.data.title }}</div>
                <div class="message-status">
                  <Icon v-if="r.seen" name="tickdouble" />
                  <p class="message-sended-timing" v-if="r.lastMessages[0]">
                    {{ getRelativeTime(r.lastMessages[0].timestamp) }}
                  </p>
                </div>
              </div>
              <div class="message-btm">
                <p class="message-content">
                  <strong>{{
                    r.lastMessages[0]
                      ? `${r.lastMessages[0].sender} : `
                      : "Aucun message envoyé."
                  }}</strong
                  >{{ r.lastMessages[0] ? r.lastMessages[0].text : "" }}
                </p>
                <div class="message-status">
                  <Icon v-if="r.pinned" name="pin" />
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>
      <div class="message-sidebar-footer">
        <button @click="handleLogout()">Se déconnecter</button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import Icon from "./lib/Icon.vue";

import { ref, onMounted, onUnmounted, watchEffect } from "vue";
import { useRoomStore } from "@/stores/roomStore";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
const router = useRouter();
const user = useUserStore();
const room = useRoomStore();
const messages = ref([]);

watchEffect(() => {
  room.roomList.lastMessage,
    (newLastMessage) => {
      console.log("There is a new last message", newLastMessage);
    };
});

const getRelativeTime = (timestamp) => {
  const now = Date.now();
  timestamp = new Date(timestamp).getTime();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const hoursFormatted = String(date.getHours()).padStart(2, "0");
  const minutesFormatted = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month} - ${hoursFormatted}:${minutesFormatted}`;
};

const handleLogout = () => {
  if (user.logout()) router.push("/login");
};

// {
//   sender: "Romain P.",
//   content: "Yo la street, ceci est un test de message long pour le projet",
//   sendedAt: 1731054882,
//   status: "sended",
//   seen: false,
//   pinned: false,
// },
// {
//   sender: "Hugo W.",
//   content: "Salut les mecs, ceci est un test de message long pour le projet",
//   sendedAt: 1731054882,
//   status: "sended",
//   seen: true,
//   pinned: true,
// },
</script>

<style scoped lang="scss">
.message-sidebar-container {
  display: flex;
  flex-direction: column;
  min-width: 250px;
  max-height: calc(100svh - 40px);
  overflow-y: auto;
  background-color: #202329;
  border-top-left-radius: 1rem;
  border-bottom-left-radius: 1rem;
  padding: 20px;
  .message-sidebar {
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    .message-sidebar-header {
      height: 50px;
      .message-searchbar {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background-color: #333;
        border-radius: 10px;
        padding: 0.5rem;
        input {
          background-color: #333;
          border: none;
          color: #fff;
          font-size: 1rem;
          width: 100%;
          &:focus {
            outline: none;
          }
        }
        .icon {
          display: flex;
          fill: transparent;
          stroke: #a9aeba;
          color: #a9aeba;
          width: 16px;
        }
      }
    }
    .message-sidebar-body {
      height: 100%;
      display: flex;
      flex-direction: column;
      a {
        text-decoration: none;
      }

      .message-card {
        display: flex;
        justify-content: space-between;
        width: calc(100% - 1rem);
        max-height: 50px;
        // max-width: 230px;
        padding: 0.5rem;
        &:hover {
          background-color: #2e333d;
          border-radius: 0.5rem;
        }
        .message-img {
          width: 50px;
          flex-shrink: 0;
          height: 50px;
          background-color: #333;
          border-radius: 20%;
        }
        .message-body {
          width: 70%;
          display: flex;
          flex-direction: column;
          .message-top {
            display: flex;
            justify-content: space-between;
            width: 100%;
            height: 50%;
            .message-sender {
              font-size: 1.2rem;
              font-weight: 600;
              color: #fff;
              text-wrap: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .message-status {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              .message-sended-timing {
                display: flex;
                align-items: center;
                font-size: 0.7rem;
                color: #a9aeba;
              }
              .icon {
                flex-shrink: 0;
                display: flex;
                stroke: #a9aeba;
                width: 16px;
                aspect-ratio: 1;
              }
            }
          }
          .message-btm {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            height: 50%;
            gap: 1rem;
            .message-content {
              font-size: 0.8rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              color: #a9aeba;
            }
            .message-status {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              .message-sended-timing {
                display: flex;
                align-items: center;
                font-size: 0.8rem;
                color: #a9aeba;
              }
              .icon {
                flex-shrink: 0;
                display: flex;
                stroke: #a9aeba;
                color: #a9aeba;
                width: 20px;
                aspect-ratio: 1;
              }
            }
          }
        }
      }
    }
  }
}
</style>
