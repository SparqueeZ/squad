<template>
  <section
    class="pc-separator"
    :style="`height: ${height}; width:${width}`"
  ></section>
</template>

<script setup lang="ts">
const props = defineProps({
  height: String,
  width: String,
});
</script>

<style scoped>
.pc-separator {
  display: flex;
  flex-shrink: 0;
}
</style>
