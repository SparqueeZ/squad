<template>
  <main class="chatroom-container" v-if="true">
    <popupComponent />
    <Sidebar />
    <messagesSidebar v-if="user.username" />
    <div v-else class="errorMessageSidebar">Chargement messages sidebar</div>
    <section v-if="user.username" class="chatroom-container">
      <router-view></router-view>
    </section>
    <section v-else class="chatroom-container">
      <div class="chatroom-dummy">Chargement...</div>
    </section>
    <aside class="chatInfosSidebar closed">
      <p>Chat Details</p>
    </aside>
  </main>
  <main v-else>
    <router-view></router-view>
  </main>
</template>

<script setup lang="ts">
import popupComponent from "@/components/popupComponent.vue";
import Sidebar from "../components/sidebar.vue";
import messagesSidebar from "@/components/messagesSidebar.vue";
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/chatStore";
import { useUserStore } from "@/stores/userStore";
import { useRoomStore } from "@/stores/roomStore";
const chat = useChatStore();
const room = useRoomStore();
const user = useUserStore();
import { useRoute } from "vue-router";
const route = useRoute();
import { useRouter } from "vue-router";
const router = useRouter();

const isChatOnlyRoute = () => {
  console.log(route.fullPath);
  if (route.fullPath === "/chat/" || route.fullPath === "/chat") {
    return false;
  }
  return true;
};

const checkUser = () => {
  if (!user.username) {
    router.push("/login");
  }
};

onMounted(async () => {
  await user.fetchProfile();
  // user.rooms.forEach(async (room) => {
  //   await chat.fetchChatListByRoomId(room.data.id);
  // });
  // await room.fetchRoomList();
  checkUser();

  // console.log(user.username);
  // setTimeout(() => {}, 1000);
});
</script>

<style scoped lang="scss">
.chatroom-container {
  width: 100%;
  min-height: 100svh;
  background-color: #131313;
  display: flex;
  overflow: hidden;
  .chatroom-dummy {
    width: 100%;
    height: 100vh;
    background-color: #202329;
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 2rem;
  }
}

.chatInfosSidebar {
  &.closed {
    min-width: none;
    width: 0;
  }
  &.open {
    min-width: 250px;
  }
}
</style>
