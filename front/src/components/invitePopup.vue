<template>
  <section class="invite-container">
    <h2>Invite a friend</h2>
    <p>Invite your friends to join the chatroom by sharing the link below:</p>

    <button>Copy link</button>
    <select>
      <option
        v-for="friend in user.friends"
        :key="friend._id"
        :value="friend._id"
      >
        {{ friend.username }}
      </option>
    </select>
  </section>
</template>

<script setup>
import { useUserStore } from "@/stores/userStore";
const user = useUserStore();
</script>

<style lang="scss" scoped></style>
