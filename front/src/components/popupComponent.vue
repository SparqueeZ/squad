<template>
  <div
    v-if="popupStore.isVisible"
    class="popup-overlay"
    @click="popupStore.closePopup"
  >
    <div class="popup-content" @click.stop>
      <component :is="popupStore.content"></component>
    </div>
  </div>
</template>

<script setup>
import { usePopupStore } from "@/stores/popupStore";

const popupStore = usePopupStore();
</script>

<style lang="scss" scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  animation: fadeIn 0.5s forwards;
  .popup-content {
    width: 500px;
    height: 500px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transform: scale(0);
    animation: scaleUp 0.2s forwards;
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes scaleUp {
  to {
    transform: scale(1);
  }
}
</style>
