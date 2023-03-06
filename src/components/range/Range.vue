<template lang="pug">
input.input-range(
  :class="{'disable': isDisable}"
  ref="input"
  type="range"
  min="0"
  max="1"
  step="0.1"
  name="range"
  :value="volumeValue"
  :id="id"
  @input="getRange"
)
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, watch } from 'vue';

  export default defineComponent({
    name: 'Range',
    emits: ['input'],
    props: {
      volumeValue: {
        type: Number,
        default: 0,
      },
      id: {
        type: String,
        default: '',
      },
      isDisable: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const input = ref<HTMLElement | null>(null);

      const getStyle = (colorValue: string) => {
        if (!input.value) return;
        input.value.style.background = `linear-gradient(to right, var(--active-color) 0%, var(--active-color) ${
          colorValue * 100
        }%, var(--sui-gray-500) ${colorValue * 100}%, var(--sui-gray-500) 100%)`;
      };

      const getProgress = () => {
        getStyle(props.volumeValue);
      };

      const getRange = () => {
        getStyle(input.value.value);
        emit('input', input.value.value);
      };

      watch(
        () => props.volumeValue,
        () => {
          getProgress();
        },
        {
          deep: true,
        }
      );

      onMounted(() => {
        getProgress();
      });
      return { input, getRange };
    },
  });
</script>

<style scoped>
  .input-range {
    align-items: center;
    -webkit-appearance: none;
    background: linear-gradient(
      to right,
      var(--active-color) 0%,
      var(--active-color) 50%,
      var(--sui-gray-500) 50%,
      var(--sui-gray-500) 100%
    );
    border: none;
    border-radius: 1px;
    --active-color: #662eff;
    cursor: pointer;
    display: flex;
    height: 2px;
    outline: none;
    transition: background 450ms ease-in;
    width: 100%;
    &:hover,
    &:active {
      --active-color: #5729d0;
    }
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      background: var(--sui-white);
      border: 2px solid var(--active-color);
      border-radius: 50%;
      box-sizing: border-box;
      cursor: pointer;
      height: 10px;
      margin: 0;
      width: 10px;
      &:hover,
      &:active {
        border-color: var(--active-color);
      }
    }
    &::-moz-range-thumb {
      background: var(--sui-white);
      border: 2px solid var(--active-color);
      border-radius: 50%;
      box-sizing: border-box;
      cursor: pointer;
      height: 10px;
      margin: 0;
      position: relative;
      width: 10px;
      z-index: 5; /* z-index 5-10: style elements (focus, hover decor) */
      &:hover,
      &:active {
        border-color: var(--active-color);
      }
    }
    &::-ms-thumb {
      background: var(--sui-white);
      border: 2px solid var(--active-color);
      border-radius: 50%;
      box-sizing: border-box;
      cursor: pointer;
      height: 10px;
      margin: 0;
      width: 10px;
      &:hover,
      &:active {
        border-color: var(--active-color);
      }
    }
  }
</style>
