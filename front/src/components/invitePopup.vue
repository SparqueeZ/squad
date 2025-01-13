<template>
  <section class="invite-container">
    <h2>Inviter un ami</h2>
    <p>Sélectionnez la personne que vous voulez inviter dans la room :</p>
    <select v-model="selectedFriend">
      <option
        v-for="friend in user.friends"
        :key="friend._id"
        :value="friend._id"
      >
        {{ friend.username }}
      </option>
    </select>
    <button @click="inviteFriend">Invite</button>
    <p>{{ responseMessage }}</p>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRoute } from "vue-router";
import axios from "@/assets/axios";

const responseMessage = ref("");
const user = useUserStore();
const route = useRoute();
const roomLink = `${window.location.origin}/chat/${route.params.id}`;
const selectedFriend = ref("");

const inviteFriend = async () => {
  if (!selectedFriend.value) return;
  try {
    await axios.post("/api/chat/room/invite", {
      roomId: route.params.id,
      userId: selectedFriend.value,
    });
  } catch (error) {
    responseMessage.value = `${error.response.data.message}.`;
    console.error("Error inviting friend:", error.response.data.message);
  }
};
</script>

<style lang="scss" scoped>
.invite-container {
  height: 100%;
  background-color: #2e333d;
  color: #fff;
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  input {
    background-color: #202329;
    color: #fff;
    border: none;
    padding: 0.5rem;
    border-radius: 5px;
    &:focus {
      outline: none;
      background-color: #333;
    }
  }
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
  select {
    background-color: #202329;
    color: #fff;
    border: none;
    padding: 0.5rem;
    border-radius: 5px;
    &:focus {
      outline: none;
      background-color: #333;
    }
  }
}
</style>
