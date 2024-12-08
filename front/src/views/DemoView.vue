<template>
  <div>
    <button @click="onClick">Click me</button>
    <div id="turnstile"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const captchaToken = ref("");

onMounted(() => {
  turnstile.render("#turnstile", {
    sitekey: "0x4AAAAAAA1lSa4o0C87pIHl", // Update this with your site key
    callback: function (token) {
      captchaToken.value = token;
    },
  });
});
</script>

<style lang="scss" scoped></style>
