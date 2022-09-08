<i18n>
{
  "en": {
    "callInfo": "More calls: "
  },
  "ru": {
    "callInfo": "Другие звонки: "
  }
}
</i18n>

<template lang="pug">
.active-call(v-if="!settings.minimize" :class="{'active-call-max': settings.maximize, 'active-call-min': !settings.maximize}")
  CallInfo(:callData="activeCall" @click="setActiveCall(currentActiveCallId)")
  .button-wrap(v-if="!settings.maximize")
    Typography.calls-text(fontColor="--sui-gray-800") {{ `${t('callInfo')} ${calls.length - 1}` }}
    Button.button-select(
      mode="secondary"
      ref="select"
      @click="isOpen = !isOpen"
    )
      Icon.icon(
        name="ic20-chevron-down"
        color="--sui-gray-900"
        :class="{'transform': isOpen}"
      )
    transition(name="fade")
      DropdownList.call-active-list(v-if="isOpen")
        ul.select-list
          li.list-item(
            v-for="(item, key) in calls"
            @click="setActiveCall(item.id)"
            :key="key"
          )
            CallInfo(:callData="item")
</template>

<script lang="ts">
  import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import { Button, generateCheckClickOutside, Icon, Typography } from '@voximplant/spaceui';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import { useI18n } from 'vue-i18n';
  import DropdownList from '@/components/common/DropdownList.vue';
  import {
    $currentActiveCallId,
    activeCalls,
    currentActiveCall,
    setActiveCall,
  } from '@/store/calls/index';
  import { useStore } from 'effector-vue/composition';
  import { $settings } from '@/store/settings';

  export default defineComponent({
    name: 'ActiveCall',
    components: { DropdownList, CallInfo, Typography, Button, Icon },
    setup() {
      const { t } = useI18n();
      const select = ref<HTMLDivElement | null>(null);
      const calls = useStore(activeCalls);
      const isOpen = ref(false);
      const checkClickOutside = generateCheckClickOutside(select);
      const activeCall = useStore(currentActiveCall);
      const currentActiveCallId = useStore($currentActiveCallId);
      const settings = useStore($settings);

      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutside(event) && isOpen.value) {
          isOpen.value = !isOpen.value;
        }
      };

      const closeSelect = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen.value) isOpen.value = false;
      };

      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', closeSelect);
      });

      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', closeSelect);
      });

      return { t, isOpen, select, calls, setActiveCall, activeCall, settings, currentActiveCallId };
    },
  });
</script>

<style scoped>
  .active-call-max {
    display: flex;
    position: absolute;
    width: fit-content;
  }
  .active-call-min {
    border-bottom: 1px solid var(--sui-gray-300);
    padding: 16px 20px;
    width: calc(100% - 40px);
    height: fit-content;
  }
  .active-call {
    display: flex;
    justify-content: space-between;
    position: relative;
    & .button-wrap {
      align-items: center;
      display: flex;
    }
    & .calls-text {
      display: inline-block;
      font-size: 14px;
      line-height: 16px;
      margin-right: 8px;
      overflow: hidden;
      text-align: right;
      text-overflow: ellipsis;
      width: 100px;
    }
    & .button-select {
      height: 40px;
      width: 40px;
    }
    & .select-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    & .icon {
      transition: transform 0.1s ease-out;
    }
    & .transform {
      transform: rotate(180deg);
      transition: transform 0.1s ease-out;
    }
    & .list-item {
      padding: 8px 16px;
    }
    & .call-active-list {
      right: 24px;
      top: calc(100% - 5%);
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.1s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
