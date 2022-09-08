<template lang="pug">
.loading
  .dot-flashing
</template>

<style scoped>
  .loading {
    display: flex;
    justify-content: center;
    width: 24px;
    & .dot-flashing {
      animation: dotFlashing 1s infinite linear alternate;
      animation-delay: 0.2s;
      background-color: var(--sui-purple-500);
      border-radius: 5px;
      color: var(--sui-purple-500);
      height: 4px;
      position: relative;
      width: 4px;
    }

    & .dot-flashing::before,
    & .dot-flashing::after {
      content: '';
      display: inline-block;
      position: absolute;
      top: 0;
    }

    & .dot-flashing::before {
      animation: dotFlashing 1s infinite alternate;
      animation-delay: 0s;
      background-color: var(--sui-purple-500);
      border-radius: 5px;
      color: var(--sui-purple-500);
      height: 4px;
      left: -10px;
      width: 4px;
    }

    & .dot-flashing::after {
      animation: dotFlashing 1s infinite alternate;
      animation-delay: 0.7s;
      background-color: var(--sui-purple-500);
      border-radius: 5px;
      color: var(--sui-purple-500);
      height: 4px;
      left: 10px;
      width: 4px;
    }

    @keyframes dotFlashing {
      0% {
        background-color: var(--sui-purple-500);
      }
      50%,
      100% {
        background-color: var(--sui-purple-200);
      }
    }
  }
</style>
