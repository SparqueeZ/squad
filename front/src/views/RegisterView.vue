<template>
    <div class="login">
      <img src="@/assets/img/logo-squad@2x.png" alt="Logo" class="logo" />
      <h2>Créer un compte</h2>
      <form @submit.prevent="register">
        <input
          v-model="email"
          type="email"
          placeholder="Adresse e-mail"
          required
          class="input-field"
        />
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
          <button type="submit" class="btn-primary">Créer un compte</button>
          <button type="button" @click="goToLogin" class="btn-secondary">Retour à la connexion</button>
        </div>
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
  const password = ref("");
  const router = useRouter();
  
  const register = () => {
  // Validation des données
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex pour un email valide
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}[\]:;<>,.?~\\/-]{12,}$/; // Regex pour un mot de passe valide
  
  if (!emailRegex.test(email.value)) {
    alert("Veuillez entrer une adresse email valide.");
    return;
  }

  if (!passwordRegex.test(password.value)) {
    alert(
      "Le mot de passe doit contenir au moins 12 caractères, une majuscule, un chiffre et un caractère spécial."
    );
    return;
  }

  // Envoi des données pour création du compte
  console.log("Validation réussie, création du compte...");
  socket.emit(
    "register",
    {
      email: email.value,
      username: username.value,
      password: password.value,
    },
    (response) => {
      if (response.success) {
        alert("Compte créé avec succès !");
        router.push("/chat/673382c2f30357627ee996e4");
      } else {
        alert(response.error || "Une erreur s'est produite lors de la création du compte.");
      }
    }
  );
};
  
  // Rediriger vers la page de connexion
  const goToLogin = () => {
    router.push("/");
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
  