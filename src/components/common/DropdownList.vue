<template lang="pug">
.dropdown-list.scrollbars
  slot
</template>

<style scoped>
  .dropdown-list {
    background-color: var(--sui-white);
    border: 1px solid #e3e4eb;
    border-radius: 4px;
    box-shadow: var(--sui-shadow-01);
    box-sizing: border-box;
    margin: 0;
    max-height: 335px;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 8px 0;
    position: absolute;
    width: calc(100% - 48px);
    z-index: 16; /* z-index 16-20: dropdown call list & incoming call  */
  }
</style>
