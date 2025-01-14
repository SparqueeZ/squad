<template>
    <section class="createContainer">
        <h2>Créer un salon de discussion</h2>
        <input
            v-model="title"
            type="text"
            placeholder="Nom du salon"
            required
            class="input-field"
        />
        <input
            v-model="description"
            type="text"
            placeholder="Description"
            required
            class="input-field"
        />
        <input
            type="file"
            @change="onFileChange($event, 'avatar')"
            class="input-field"
        />
    </section>
</template>

<script setup>

const onFileChange = (event, type) => {
  const file = event.target.files[0];
  if (type === "avatar") {
    avatar.value = file;
  } else if (type === "banner") {
    banner.value = file;
  }
};

</script>

<style lang="scss" scoped>
.createContainer {
    height: 100%;
    background-color: #2e333d;
    color: #fff;
    padding: 1rem;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
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
}
</style>
