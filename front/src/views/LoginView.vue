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
      <input
        v-model="mfa"
        type="text"
        placeholder="Code MFA"
        class="input-field"
      />
      <div id="turnstile"></div>
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
import { useUserStore } from "@/stores/userStore";
// import { useRoomStore } from "@/stores/roomStore";
import { useSecurityStore } from "@/stores/securityStore";
const user = useUserStore();
// const room = useRoomStore();
const security = useSecurityStore();

const username = ref("Baptiste");
const password = ref("12345");
const mfa = ref("123465");
const captchaToken = ref("");
// const csrfToken = ref("");
const router = useRouter();

const login = async () => {
  // if (username.value && password.value && captchaToken.value) {
  if (username.value && password.value) {
    // This line is for testing without captcha
    // const response = await fetch(
    //   "https://api.sparqueez.org/api/validate-captcha",
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // "CSRF-Token": csrfToken.value ? csrfToken.value : "",
    //     },
    //     body: JSON.stringify({ token: captchaToken.value }),
    //   }
    // );

    // const data = await response.json();
    // if (data.success) {
    if (true) {
      // This line is for testing without captcha
      user.login(username.value, password.value, mfa.value);
      setTimeout(() => {
        console.log(user.username);
        if (user.username) {
          router.push("/67562a9100035c1096e6ba9d");
        }
      }, 1000);
    } else {
      alert("Captcha validation failed. Please try again.");
    }
  }
};

// Rediriger vers la page de création de compte
const goToRegister = () => {
  router.push("/register");
};

onMounted(async () => {
  // turnstile.render("#turnstile", {
  //   sitekey: "0x4AAAAAAA1lSa4o0C87pIHl",
  //   callback: function (token) {
  //     captchaToken.value = token;
  //   },
  // });
  // try {
  //   await security.fetchCsrfToken();
  // } catch (error) {
  //   console.error(error);
  // }
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
