<template lang="pug">
.split-button
  slot(name="first-side")
  slot(name="last-side")
</template>

<style scoped>
  .split-button {
    display: flex;
  }
</style>
