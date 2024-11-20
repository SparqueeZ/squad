<template>
  <div class="login">
    <h2>Connectez-vous</h2>
    <form @submit.prevent="login">
      <input
        v-model="username"
        type="text"
        placeholder="Nom d'utilisateur"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
        required
      />
      <button type="submit">Se connecter</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
const APIURL = import.meta.env.VITE_API_URL;
const socket = io(APIURL);
import { useUserStore } from "@/stores/userStore";
const user = useUserStore();

const username = ref("");
const password = ref("123");
const router = useRouter();

const login = () => {
  if (username.value && password.value) {
    user.login(username.value, password.value);
    if (user.username) {
      router.push("/chat/673672da816c66f9b8c7d4ff");
    } else {
      console.log("Failed to log in");
    }
  }
  user.login(username.value, password.value);
  // if (username.value) {
  //   // localStorage.setItem("username", username.value);
  //   // localStorage.setItem("userId", 0);
  //   // localStorage.setItem("roomsId", "673382c2f30357627ee996e4");
  //   router.push("/chat/673382c2f30357627ee996e4");
  // }
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
