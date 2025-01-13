<template>
  <div class="login">
    <img src="@/assets/img/logo-squad@2x.png" alt="Logo" class="logo" />
    <h2>Créer un compte</h2>
    <form @submit.prevent="register">
      <input
        v-model="username"
        type="text"
        placeholder="Nom d'utilisateur"
        required
        class="input-field"
      />
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        required
        class="input-field"
      />
      <input
        v-model="biography"
        type="text"
        placeholder="Biographie"
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
      <input
        v-model="confirmedPassword"
        type="password"
        placeholder="Confirmez le mot de passe"
        required
        class="input-field"
      />
      <input
        type="file"
        @change="onFileChange($event, 'avatar')"
        class="input-field"
      />
      <input
        type="file"
        @change="onFileChange($event, 'banner')"
        class="input-field"
      />
      <div class="button-group">
        <button type="submit" class="btn-primary">Créer un compte</button>
        <button type="button" @click="goToLogin" class="btn-secondary">
          Retour à la connexion
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
//import { io } from "socket.io-client";
const APIURL = import.meta.env.VITE_API_URL;
//const socket = io(APIURL);
import { useUserStore } from "@/stores/userStore";
const user = useUserStore();

const username = ref("Baptisto");
const email = ref("bapt@gmail.com");
const biography = ref("b");
const password = ref("12345");
const confirmedPassword = ref("12345");
const avatar = ref(null);
const banner = ref(null);
const router = useRouter();

const onFileChange = (event, type) => {
  const file = event.target.files[0];
  if (type === "avatar") {
    avatar.value = file;
  } else if (type === "banner") {
    banner.value = file;
  }
};

function validateInput(username, password, email) {
  const regexUsername = /^[\p{L}\p{N}\s]+$/u;
  const regexPassword = /^.{5,}$/;
  const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!regexUsername.test(username) || !regexPassword.test(password) || !regexEmail.test(email) || !regexPassword.test(confirmedPassword)) {
    alert("Entrée invalide !");
    return false;
  }
  return true;
};

const register = async () => {
  if (username.value && password.value) {
    if (!validateInput(username.value, password.value, email.value)) {
      e.preventDefault();
    }
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("email", email.value);
    formData.append("bio", biography.value);
    formData.append("password", password.value);
    formData.append("confirmedPassword", confirmedPassword.value);
    
    if (avatar.value) {
      formData.append("avatar", avatar.value);
    }
    if (banner.value) {
      formData.append("banner", banner.value);
    }

    try {
      await user.register(formData);
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la création du compte : ", error);
    }
  }
};

// Rediriger vers la page de connexion
const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #202329, #202329); /* Fond sombre */
  padding: 20px;
  text-align: center;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
}

h2 {
  color: #f39c12; /* Orange pour le titre */
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  max-width: 300px;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #555;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
  margin-left: auto;
  margin-right: auto;
  background-color: #222;
  color: #fff;
}

.input-field:focus {
  border-color: #f39c12; /* Orange au focus */
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
  background-color: #444;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #555; /* Hover plus clair */
}
</style>
