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
          spriteUrl="/static/icons-pack.svg"
          name="ic24-videocamera-mute"
          width="20"
          height="20"
        )
    .number
      Hint(
        :text="activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settingsState.minimize ? t(`errors.${activeCall?.status}`) : ''"
      )
        .number
          Icon.icon-error(
            v-if="activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settingsState.minimize"
            color="--sui-red-500"
            name="ic24-error-fill"
            width="20"
            height="20"
          )
          Typography.phone-number(
            :class="{'error' : activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settingsState.minimize }"
            :fontColor="getColor ? '--sui-white' : '--sui-gray-900'"
            :fontSize="isWindow ? '14px' : '16px'"
          ) {{ activeCall?.number }}
    .status(v-if="!isWindow && !settingsState.maximize")
      Typography.call-time(v-if="!settingsState.minimize") {{ activeCall?.status === 'CONNECTED' && !activeCall.active ? `${t('statuses.pause')}&nbsp; · &nbsp;` : ''}}
      Typography.call-time(v-if="callDuration[activeCall?.id] && activeCall?.status === 'CONNECTED'") {{ activeCall?.active ? timeFormat(callDuration[activeCall.id].callDuration) : timeFormat(callDuration[activeCall?.id].pauseDuration) }}
      Loading.animation(v-if="!callDuration[activeCall?.id]")
      .error-container(v-if="!settingsState.minimize && activeCall?.status !== 'CONNECTED'")
        Icon.icon-error(
          v-if="activeCall?.status !== 'PROGRESSING'"
          color="--sui-red-500"
          name="ic24-error-fill"
          width="20"
          height="20"
        )
        Typography.error {{ activeCall?.status === 'PROGRESSING' ? '' : t(`errors.${activeCall?.status}`) }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Icon, Typography } from '@voximplant/spaceui';
  import Loading from '@/components/animation/Loading.vue';
  import { useStore } from 'effector-vue/composition.cjs';
  import { $callDuration, $calls, $currentActiveCallId, currentActiveCall } from '@/store/calls';
  import { $settings } from '@/store/settings';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'UserWithoutVideo',
    components: {
      Icon,
      Typography,
      Loading,
    },
    props: {
      isWindow: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const { t } = useI18n();
      const activeCall = useStore(currentActiveCall);
      const settingsState = useStore($settings);
      const allCalls = useStore($calls);
      const currentActiveCallId = useStore($currentActiveCallId);
      const callDuration = useStore($callDuration);
      const isRemoteMute = computed(() => allCalls.value[currentActiveCallId.value]?.params.muted);
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
      };
    },
  });
</script>

<style scoped>
  .background {
    position: absolute;
    background: rgba(27, 13, 51, 0.7);
    border-radius: 8px;
    z-index: 11;
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

    .user-info {
      position: absolute;
      transform: translate(-50%, -50%);
      top: 50%;
      left: 50%;
      text-align: center;
    }
    & .avatar-wrap {
      align-items: center;
      position: relative;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 64px;
      justify-content: center;
      margin-bottom: 8px;
      width: 64px;
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
    & .phone-number {
      display: block;
      margin-bottom: 4px;
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
      min-height: 30px;
    }
    & .error-container {
      align-items: center;
      display: flex;
    }
    & .icon-error {
      margin-right: 6px;
    }
    .error {
      color: var(--sui-red-500);
    }
  }
</style>
