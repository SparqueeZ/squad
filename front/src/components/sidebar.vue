<template>
  <aside class="main-sidebar-container">
    <div class="main-sidebar">
      <div class="main-sidebar-header">
        <img src="../assets/img/logo-squad@2x.png" alt="" srcset="" />
      </div>
      <div class="main-sidebar-body">
        <router-link to="/chatroom">
          <Icon name="chats" />
        </router-link>
        <router-link to="/profile"> <Icon name="identity" /></router-link>
      </div>
    </div>
  </aside>
</template>

<script setup>
import Icon from "./lib/Icon.vue";
</script>

<style scoped lang="scss">
.main-sidebar-container {
  max-width: calc(24px + 20px);

  .main-sidebar {
    width: fit-content;
    .main-sidebar-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 40px;
      }
    }
    .main-sidebar-body {
      display: flex;
      flex-direction: column;
      a {
        color: white;
        text-decoration: none;
        padding: 10px;
        .icon {
          display: flex;
          width: 24px;
          fill: none;
          color: #fff;
        }
        &:hover {
          background-color: #333;
        }
      }
    }
  }
}
</style>
