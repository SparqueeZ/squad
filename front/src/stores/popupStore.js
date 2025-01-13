import { defineStore } from "pinia";
import { ref } from "vue";

export const usePopupStore = defineStore("popup", () => {
  const isVisible = ref(false);
  const content = ref(null);

  // Ouvrir la popup avec un contenu
  const openPopup = (newContent) => {
    content.value = newContent;
    isVisible.value = true;
  };

  // Fermer la popup
  const closePopup = () => {
    isVisible.value = false;
    content.value = null;
  };

  return {
    isVisible,
    content,
    openPopup,
    closePopup,
  };
});
