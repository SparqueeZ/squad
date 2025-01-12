<script setup>
import { useUserStore } from "@/stores/userStore";
import TheWelcome from "../components/TheWelcome.vue";
const user = useUserStore();

console.log(user.username);
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
