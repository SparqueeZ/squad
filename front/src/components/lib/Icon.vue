<template>
  <span class="icon" :name="name" v-html="iconHTML"></span>
</template>

<script setup>
import { defineProps, computed } from "vue";
import { icons } from "@/assets/lib/icons.js";

const { name } = defineProps(["name"]);
const iconHTML = computed(
  () => icons.find((icon) => icon.name === name)?.[name]
);
</script>

<style>
.icon {
  aspect-ratio: 1/1;
  transition: fill 0.3s ease;
}

.icon-hover:hover .icon {
  fill: url(#like-gradient);
}
</style>
