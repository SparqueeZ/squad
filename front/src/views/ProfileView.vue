<template>
  <div class="profile-page">
    <div class="profile-banner">
      <img
        :src="user.banner || defaultBanner"
        alt="User Banner"
        class="banner-image"
      />
    </div>

    <div class="profile-header">
      <div class="profile-picture">
        <img
          :src="`${APIURL}/api/auth/uploads/${user.avatar}` || defaultAvatar"
          alt="User Profile"
        />
      </div>
      <div class="profile-info">
        <h1 class="username">{{ user.username }}</h1>
        <p class="bio">{{ user.bio || "Aucune bio disponible." }}</p>
      </div>
    </div>

    <div class="profile-content">
      <div class="content-section">
        <h2 class="section-title">Informations personnelles</h2>

        <div v-if="isUserProfile" class="info-item">
          <span class="label">Email :</span>
          <div class="container-input">
            <span class="value">{{ user.email }}</span>
            <input v-model="email" type="text" required class="input-field" />
            <button
              v-if="isUserProfile"
              class="edit-button"
              @click="updateEmail"
            >
              Modifier
            </button>
          </div>

          <div class="info-item">
            <button
              v-if="isUserProfile"
              :class="user.mfaStatus === true ? `mfa-true` : `mfa-false`"
              @click="mfaController"
            >
              MFA ?
            </button>
          </div>
        </div>

        <div class="info-item">
          <span class="label">Date d'inscription :</span>
          <span class="value">{{
            isUserProfile ? user.createdAt : convertDate(user.createdAt)
          }}</span>

          <div class="content-section">
            <div
              id="qr-code-container"
              style="text-align: center; margin-top: 20px"
            ></div>
          </div>
        </div>

        <div class="content-section"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import defaultAvatar from "../assets/img/default-avatar.jpg";
import defaultBanner from "../assets/img/default-banner.jpg";
import { useUserStore } from "@/stores/userStore";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
const route = useRoute();
const APIURL = import.meta.env.VITE_API_URL;

const userStore = useUserStore();
const user = ref({});
const email = ref("");
let isUserProfile = ref(false);

const convertDate = (date) => {
  return dayjs(date).format("DD/MM/YYYY");
};

const updateEmail = async () => {
  if (email.value) {
    userStore.updateEmail(email.value);
  } else {
    console.error("Champ d'entré vide");
  }
};

onMounted(async () => {
  if (route.params.id) {
    const response = await userStore.fetchProfileById(route.params.id);
    user.value = response.user;
    isUserProfile.value = false;
  } else {
    await userStore.fetchProfile();
    user.value = userStore;
    isUserProfile = true;
  }
});

const mfaController = async () => {
  console.log(user.value.username);
  const qrCodeContainer = document.getElementById("qr-code-container");
  qrCodeContainer.innerHTML = "";
  const qrcode = await userStore.updateMfaStatus(user.value.username);
  if (qrcode != null) {
    displayQRCode(qrcode);
  }
};

async function displayQRCode(qrCodeImage) {
  const qrCodeContainer = document.getElementById("qr-code-container");
  console.log("display is here");
  try {
    if (qrCodeImage) {
      // Création d'une balise <img> pour afficher le QR code
      const img = document.createElement("img");
      img.src = qrCodeImage; // Attribue la source du QR code
      img.alt = "QR Code MFA";
      img.style.width = "200px"; // Exemple de taille
      img.style.height = "200px";

      qrCodeContainer.appendChild(img);
    }
  } catch (error) {
    console.error("Erreur : ", error);
    qrCodeContainer.innerText = "Impossible d'afficher le QR Code.";
  }
}
</script>

<style scoped lang="scss">
.profile-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #202329;
  overflow: auto;
  color: #fff;

  .profile-banner {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background-color: #404e6b;

    .banner-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: -50px;
    padding: 1rem;
    width: 60%;

    .profile-picture {
      width: 100px;
      align-items: center;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #2e333d;
      background-color: #2e549e;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .profile-info {
      .username {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 0;
      }

      .bio {
        font-size: 1rem;
        color: #a9aeba;
        margin-top: 0.5rem;
      }
    }
  }

  .profile-content {
    width: 90%;
    max-width: 800px;
    margin-top: 2rem;

    .content-section {
      background-color: #2e333d;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;

      .section-title {
        font-size: 1.3rem;
        font-weight: bold;
        margin-bottom: 1rem;
        border-bottom: 1px solid #333;
        padding-bottom: 0.5rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;

        .mfa-true {
          background-color: #126318; /* Couleur légèrement plus foncée que le fond */
          border: none;
          color: #fff;
          font-size: 0.8rem;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #2e333d; /* Couleur encore plus foncée au survol */
          }
        }

        .mfa-false {
          background-color: #85160e; /* Couleur légèrement plus foncée que le fond */
          border: none;
          color: #fff;
          font-size: 0.8rem;
          padding: 0.3rem 0.6rem;
          border-radius: 5px;
          cursor: pointer;
          transition: background-color 0.2s ease;

          &:hover {
            background-color: #2e333d; /* Couleur encore plus foncée au survol */
          }
        }
        .container-input {
          width: 60%;
          display: flex;
          justify-content: right;
          .edit-button {
            background-color: #353d49; /* Couleur légèrement plus foncée que le fond */
            border: none;
            color: #fff;
            font-size: 0.8rem;
            padding: 0.3rem 0.6rem;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.2s ease;

            &:hover {
              background-color: #2e333d; /* Couleur encore plus foncée au survol */
            }
          }

          .input-field {
            background-color: #2e333d;
            color: white;
            width: 100%;
            text-align: right;
            margin-right: 10px;
            border: none;
            font-size: 1rem;
            &:focus {
              outline: none;
            }
          }
        }

        .label {
          color: #a9aeba;
          font-weight: bold;
        }

        .value {
          color: #fff;
        }
      }

      .activity-list {
        .activity-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #333;

          .activity-text {
            margin-bottom: 0.5rem;

            .container-input {
              width: 60%;
              display: flex;
              justify-content: right;
              .edit-button {
                background-color: #353d49; /* Couleur légèrement plus foncée que le fond */
                border: none;
                color: #fff;
                font-size: 0.8rem;
                padding: 0.3rem 0.6rem;
                border-radius: 5px;
                cursor: pointer;
                transition: background-color 0.2s ease;

                &:hover {
                  background-color: #2e333d; /* Couleur encore plus foncée au survol */
                }
              }

              .input-field {
                background-color: #2e333d;
                color: white;
                width: 100%;
                text-align: right;
                margin-right: 10px;
                border: none;
                font-size: 1rem;
                &:focus {
                  outline: none;
                }
              }
            }

            .label {
              color: #a9aeba;
            }
          }
        }
      }
    }
  }
}
</style>
