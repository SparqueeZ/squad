<template>
  <router-view />
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
const user = useUserStore();

onMounted(async () => {
  await user.fetchCsrfToken();
});
</script>

<style lang="scss">
body,
p {
  margin: 0;
  font-family: "Host Grotesk", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
</style>
