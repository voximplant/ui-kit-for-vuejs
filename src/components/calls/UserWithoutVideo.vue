<i18n>
{
  "en": {
    "statuses": {
      "pause": "Paused"
    }
  },
  "ru": {
    "statuses": {
      "pause": "Пауза"
    }
  }
}
</i18n>

<template lang="pug">
.without-video(:class="blockClasses")
  .user-info
    .avatar-wrap
      Icon(
        color="--sui-gray-400"
        name="ic24-user"
        width="42"
        height="46"
      )
      .icon-mic-off(v-if="isRemoteMute" )
        Icon.icon-mute(
          color="--sui-white"
          name="ic24-mic-off"
          width="20"
          height="20"
        )
      .icon-camera-off
        Icon.icon-mute(
          color="--sui-white"
          spriteUrl="static/icons-pack.svg"
          name="ic24-videocamera-mute"
          width="20"
          height="20"
        )
    .number
      Hint(
        :text="selectCall?.status !== 'PROGRESSING' && selectCall?.status !== 'CONNECTED' && settingsState.minimize ? t(`errors.${selectCall?.status}`) : ''"
      )
        Typography.phone-number(
          :fontColor="getColor ? '--sui-white' : '--sui-gray-900'"
          :fontSize="isWindow ? '14px' : '16px'"
        ) {{ selectCall?.number }}
    .status(v-if="!isWindow && !settingsState.maximize")
      Typography.call-time(v-if="!settingsState.minimize") {{ selectCall?.status === 'CONNECTED' && !selectCall.active ? `${t('statuses.pause')}&nbsp; · &nbsp;` : ''}}
      Typography.call-time(v-if="callDuration[selectCall?.id] && selectCall?.status === 'CONNECTED'") {{ selectCall?.active ? timeFormat(callDuration[selectCall.id].callDuration) : timeFormat(callDuration[selectCall?.id].pauseDuration) }}
      Loading.animation(v-if="showLoading")
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Icon, Typography, Hint } from '@voximplant/spaceui';
  import Loading from '@/components/animation/Loading.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import {
    $callDuration,
    $calls,
    $currentSelectCallId,
    currentActiveCall,
    currentSelectCall,
  } from '@/store/calls';
  import { $settings } from '@/store/settings';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'UserWithoutVideo',
    components: {
      Icon,
      Typography,
      Loading,
      Hint,
    },
    props: {
      isWindow: {
        type: Boolean,
        default: false,
      },
      showLoading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const activeCall = useStore(currentActiveCall);
      const settingsState = useStore($settings);
      const allCalls = useStore($calls);
      const selectCall = useStore(currentSelectCall);
      const currentSelectCallId = useStore($currentSelectCallId);
      const callDuration = useStore($callDuration);
      const isRemoteMute = computed(() => allCalls.value[currentSelectCallId.value]?.params.muted);
      const blockClasses = computed(() => ({
        background: props.isWindow,
      }));
      const getColor = computed(() => {
        return props.isWindow || settingsState.value.maximize;
      });
      return {
        t,
        callDuration,
        isRemoteMute,
        activeCall,
        settingsState,
        timeFormat,
        blockClasses,
        getColor,
        selectCall,
      };
    },
  });
</script>

<style scoped>
  .background {
    background: rgba(27, 13, 51, 0.7);
    border-radius: 8px;
  }
  .without-video {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    right: 16px;
    top: 16px;
    transition: all 0.2s ease-out;
    width: 157px;
    height: 124px;

    @media (height < 700px) {
      width: 557px !important;
    }

    .user-info {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 50%;
      left: 50%;
      text-align: center;

      overflow: hidden;
      width: 100%;

      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    & .avatar-wrap {
      align-items: center;
      position: relative;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 64px;
      justify-content: center;
      margin: auto;
      width: 64px;
    }
    & .number {
      &::v-deep(.hint-container) {
        width: inherit;
      }
      & .phone-number {
        display: block;
        color: var(--sui-white);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 90%;
        margin: auto;
      }
    }
    & .icon-mic-off {
      background-color: var(--sui-red-500);
      width: 28px;
      height: 28px;
      border-radius: 14px;
      position: absolute;
      right: -5px;
      bottom: -5px;
      display: flex;
      & .icon-mute {
        margin: auto;
      }
    }
    & .icon-camera-off {
      background-color: var(--sui-red-500);
      width: 28px;
      height: 28px;
      border-radius: 14px;
      position: absolute;
      left: -5px;
      bottom: -5px;
      display: flex;
      & .icon-mute {
        margin: auto;
        color: var(--sui-white);
      }
    }
    &.white {
      color: white;
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }
  }
</style>
