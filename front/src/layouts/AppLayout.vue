<template>
  <main class="chatroom-container">
    <Sidebar />
    <messagesSidebar />
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
</template>

<script setup lang="ts">
import Sidebar from "../components/Sidebar.vue";
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
onMounted(() => {
  user.fetchProfile();
  chat.fetchChatListByRoomId(route.params.id);
  room.fetchRoomList();
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
