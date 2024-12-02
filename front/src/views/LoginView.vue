<template>
  <div class="login">
    <img src="@/assets/img/logo-squad@2x.png" alt="Logo" class="logo" />
    <h2>Connectez-vous</h2>
    <form @submit.prevent="login">
      <input
        v-model="username"
        type="text"
        placeholder="Nom d'utilisateur"
        required
        class="input-field"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
        required
        class="input-field"
      />
      <div class="button-group">
        <button type="submit" class="btn-primary">Se connecter</button>
        <button type="button" @click="goToRegister" class="btn-secondary">
          Créer un compte
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { io } from "socket.io-client";
import { useUserStore } from "@/stores/userStore";
import { useRoomStore } from "@/stores/roomStore";
const user = useUserStore();
const room = useRoomStore();
const APISOCKETURL = import.meta.env.VITE_API_SOCKET_URL;
const socket = io(APISOCKETURL);

const username = ref("Baptiste");
const password = ref("12345");
const router = useRouter();

const login = () => {
  if (username.value && password.value) {
    user.login(username.value, password.value);
    setTimeout(() => {
      console.log(user.username);
      if (user.username) {
        router.push("/chat/673672da816c66f9b8c7d4ff");
      }
    }, 1000);
  }
  // user.login(username.value, password.value);
};

// Rediriger vers la page de création de compte
const goToRegister = () => {
  router.push("/register");
};

onMounted(() => {
  socket.on("connection", () => {
    console.log("Connected to server");
  });
});
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(
    135deg,
    #202329,
    #202329
  ); /* Fond sombre avec dégradé bleu nuit */
  padding: 20px;
  text-align: center;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
}

h2 {
  color: #f39c12; /* Orange, couleur qui s'accorde bien avec le logo */
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  max-width: 300px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #555; /* Bordure plus sombre */
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
  margin-left: auto;
  margin-right: auto;
  background-color: #222; /* Fond sombre pour le champ de saisie */
  color: #fff; /* Texte blanc dans le champ */
}

.input-field:focus {
  border-color: #f39c12; /* Bordure orange quand en focus */
  outline: none;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 20px;
  width: 100%;
  max-width: 300px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  background-color: #f39c12; /* Bouton orange */
  color: #fff;
}

.btn-primary:hover {
  background-color: #e67e22; /* Hover plus foncé */
}

.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  width: 100%;
  background-color: #444; /* Fond sombre pour le bouton secondaire */
  color: #fff;
}

.btn-secondary:hover {
  background-color: #555; /* Hover plus clair */
}
</style>
