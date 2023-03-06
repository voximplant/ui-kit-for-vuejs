<i18n>
{
  "en": {
    "buttons": {
      "end": "End call"
    },
    "statuses": {
      "pause": "Paused",
      "error": "Connection failed"
    }
  },
  "ru": {
    "buttons": {
      "end": "Завершить"
    },
    "statuses": {
      "pause": "Пауза",
      "error": "Не удалось установить соединение"
    }
  }
}
</i18n>

<template lang="pug">
.buttons-container(v-if="!isMaximize")
  Button.button(
    iconOnly
    size="l"
    :disabled="isCallPaused || isCallProgressing"
    :icon="{name: settings.mute ? 'ic24-mic-off' : 'ic24-mic', color: getIconColor(isCallPaused || isCallProgressing, false)}"
    mode="outlined"
    @click="changeMute(!settings.mute);"
  )
  Button.button(
    :disabled="isCallPaused || settings.sharing || isCallProgressing"
    size="l"
    :icon="{ spriteUrl: 'static/icons-pack.svg', name: settings.videoMute && !isCallProgressing ? 'ic24-videocamera-off' : 'ic24-videocamera', color: getIconColor(settings.sharing || isCallProgressing, true) }"
    mode="outlined"
    iconOnly
    @click="toggleVideo"
  )
  Button.button(
    v-if="selectCall"
    mode="outlined"
    iconOnly
    size="l"
    :disabled="!canCurrentCallToggleActive || isCallProgressing"
    :icon="selectCall.active ? 'ic24-pause' : 'ic24-play'"
    @click="canCurrentCallToggleActive && toggleCallStatus()"
  )
  Button.fullscreen.button(
    v-if="selectCall"
    mode="outlined"
    :disabled="isCallPaused || isCallProgressing || settings.remoteSharing"
    iconOnly
    size="l"
    :icon="{ spriteUrl: 'static/icons-pack.svg', name: settings.sharing ? 'ic24-sharing-stop' : 'ic24-sharing'}"
    @click="toggleSharing"
  )
  Button.button(
    iconOnly
    size="l"
    :disabled="isCallProgressing"
    :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
    mode="outlined"
    @click="() => { changeComponent('Dialing'); changeComponentDialingStatus('toneDial') }"
  )
  Button.button(
    iconOnly
    size="l"
    :disabled="isCallProgressing"
    :icon="{ spriteUrl: 'static/icons-pack.svg', name: 'ic24-phone-new' }"
    mode="outlined"
    @click="makeNewCall"
  )
.buttons-container(v-if="!isMaximize")
  Button.button.button-big(
    :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
    mode="alert"
    @click="() => hangUp({ id: selectCall.id })"
  ) {{ t('buttons.end') }}
transition(name="fade")
  .buttons-maximize-container(
    v-if="isMaximize && showFooter"
    :class="{'container-absolute': settings.fullscreen}"
  )
    ActiveCall.video-active-call
    .buttons(:class="{'full-screen': settings.fullscreen}")
      Button(
        iconOnly
        size="l"
        :icon="{name: settings.mute ? 'ic24-mic-off' : 'ic24-mic', color: settings.mute ? '--sui-red-500' : getMuteIconColor}"
        :disabled="isCallPaused || isCallProgressing"
        :class="getAudioBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        @click="changeMute(!settings.mute);"
      )
      Button(
        iconOnly
        size="l"
        :disabled="isCallPaused || settings.sharing || isCallProgressing"
        :icon="{ spriteUrl: 'static/icons-pack.svg', name: settings.videoMute ? 'ic24-videocamera-off' : 'ic24-videocamera' }"
        :class="getVideoBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        @click="toggleVideo"
      )
      Button(
        v-if="selectCall"
        :class="{...getFullscreenBtnClasses, 'fullscreen-disabled': !canCurrentCallToggleActive || isCallProgressing}"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :disabled="!canCurrentCallToggleActive || isCallProgressing"
        :icon="selectCall.active ? 'ic24-pause' : 'ic24-play'"
        @click="canCurrentCallToggleActive && toggleCallStatus()"
      )
      Button(
        v-if="selectCall"
        :class="{...getFullscreenBtnClasses, 'fullscreen-disabled': isCallProgressing}"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :disabled="isCallPaused || isCallProgressing || settings.remoteSharing"
        :icon="{ spriteUrl: 'static/icons-pack.svg', name: settings.sharing ? 'ic24-sharing-stop' : 'ic24-sharing'}"
        @click="toggleSharing"
      )
      Button(
        iconOnly
        size="l"
        :disabled="isCallProgressing"
        :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
        :class="getFullscreenBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        @click="() => { changeComponent('Dialing'); changeComponentDialingStatus('toneDial') }"
      )
      Button(
        iconOnly
        size="l"
        :disabled="isCallProgressing"
        :icon="{ spriteUrl: 'static/icons-pack.svg', name: 'ic24-phone-new' }"
        :class="getFullscreenBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        @click="makeNewCall"
      )
      Button(
        v-if="selectCall && !settings.fullscreen"
        :class="getFullscreenBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :disabled="isCallProgressing"
        :icon="{name: 'ic24-fullscreen'}"
        @click="toggleFullScreen(true)"
      )
      Button(
        v-if="selectCall && settings.fullscreen"
        :class="getFullscreenBtnClasses"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :disabled="isCallProgressing"
        :icon="{name: 'ic24-fullscreen-exit'}"
        @click="toggleFullScreen(false)"
      )
      Button.button.button-big(
        size="l"
        :icon="{name: 'ic24-close', color: '--sui-white'}"
        mode="alert"
        @click="() => hangUp({ id: selectCall.id })"
      )
</template>

<script lang="ts">
  import { computed, defineComponent, ref, watch } from 'vue';
  import { Button } from '@voximplant/spaceui';
  import ActiveCall from '@/components/calls/ActiveCall.vue';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition';
  import { $settings, changeMute, toggleFullScreen } from '@/store/settings';
  import {
    hangUp,
    toggleLocalVideo,
    toggleRemoteSharingVideo,
    currentSelectCall,
    $calls,
    toggleCallStatus,
  } from '@/store/calls';
  import { changeVideoParam } from '@/lib/sdkSource';
  import { changeComponent, changeComponentDialingStatus } from '@/store/components';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';

  export default defineComponent({
    name: 'VideoCallFooter',
    components: {
      ActiveCall,
      Button,
    },
    props: {
      isMaximize: {
        type: Boolean,
        default: false,
      },
    },
    setup() {
      const { t } = useI18n();
      const settings = useStore($settings);
      const allCalls = useStore($calls);
      const selectCall = useStore(currentSelectCall);
      const showAdditionalButton = useStore(needToShowAdditionalButton);

      // classes
      const getFullscreenBtnClasses = computed(() => ({
        fullscreen: settings.value.fullscreen,
        button: !settings.value.fullscreen,
      }));
      const getAudioBtnClasses = computed(() => ({
        ...getFullscreenBtnClasses.value,
        'fullscreen-media-disable': settings.value.fullscreen && settings.value.mute,
      }));
      const getVideoBtnClasses = computed(() => ({
        ...getFullscreenBtnClasses.value,
        'fullscreen-media-disable': settings.value.fullscreen && settings.value.videoMute,
        'fullscreen-disabled': settings.value.sharing || isCallProgressing.value,
      }));

      // flags
      const canCurrentCallToggleActive = computed(() => {
        const selectCallId = selectCall.value?.id;
        if (!selectCallId) return false;
        return allCalls.value[selectCallId]?.params.canToggleActive;
      });
      const isCallPaused = computed(
        () =>
          !selectCall.value?.active ||
          allCalls.value[selectCall.value?.id]?.params.remotePausedState
      );
      const isCallProgressing = computed(
        () => selectCall.value?.status === 'PROGRESSING' || selectCall.value?.status === 'ALERTING'
      );

      // hide footer for full screen mode when user be inactive
      const showFooter = ref(true);
      const SHOW_FOOTER_TIMER = 3000; // 3 second
      let isTimerEnable = false;
      let timer: ReturnType<typeof setTimeout>;
      const changeShowFooter = (param: boolean) => {
        showFooter.value = param;
      };
      const resetTimer = () => {
        if (!showFooter.value) changeShowFooter(true);
        clearTimeout(timer);
        timer = setTimeout(() => changeShowFooter(false), SHOW_FOOTER_TIMER);
      };
      const watchUserActive = () => {
        document.addEventListener('keydown', resetTimer);
        document.addEventListener('mouseup', resetTimer);
        document.addEventListener('mousemove', resetTimer);
      };
      const resetWatcher = () => {
        document.removeEventListener('keydown', resetTimer);
        document.removeEventListener('mouseup', resetTimer);
        document.removeEventListener('mousemove', resetTimer);
      };
      watch(settings, () => {
        if (settings.value.fullscreen && !isTimerEnable) {
          watchUserActive();
          isTimerEnable = true;
        } else if (!settings.value.fullscreen && isTimerEnable) {
          if (!showFooter.value) changeShowFooter(true);
          clearTimeout(timer);
          resetWatcher();
          isTimerEnable = false;
        }
      });

      const toggleVideo = () => {
        if (selectCall.value) {
          toggleLocalVideo({ id: selectCall.value?.id, status: !!settings.value.videoMute });
          changeVideoParam(!!settings.value.videoMute);
        }
      };
      const toggleSharing = () => {
        if (selectCall.value) {
          toggleRemoteSharingVideo({ id: selectCall.value?.id, status: !settings.value.sharing });
        }
      };
      const makeNewCall = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('newCall');
      };

      // getters
      const getIconColor = (disabled: boolean, video: boolean) => {
        if (disabled) return '--sui-gray-400';
        else
          return settings.value[video ? 'videoMute' : 'mute'] ? '--sui-red-500' : '--sui-gray-700';
      };
      const getMuteIconColor = computed(() => {
        if (isCallPaused.value || isCallProgressing.value) return; // for default spaceUI disabled color
        return settings.value.fullscreen ? '--sui-white' : '--sui-gray-700';
      });

      return {
        t,
        settings,
        isCallPaused,
        selectCall,
        showAdditionalButton,
        toggleVideo,
        hangUp,
        changeMute,
        makeNewCall,
        changeComponent,
        changeComponentDialingStatus,
        toggleSharing,
        toggleFullScreen,
        showFooter,
        canCurrentCallToggleActive,
        isCallProgressing,
        getIconColor,
        toggleCallStatus,
        getMuteIconColor,
        getAudioBtnClasses,
        getVideoBtnClasses,
        getFullscreenBtnClasses,
      };
    },
  });
</script>

<style scoped>
  .buttons-container {
    align-items: center;
    display: flex;
    justify-content: center;
    position: relative;
    gap: 8px;

    &:not(:last-child) {
      margin-bottom: 20px;
    }

    & .button-big {
      width: fit-content;

      & .transform {
        transform: rotate(180deg);
        transition: transform 0.1s ease-out;
      }
    }
  }

  .buttons-maximize-container {
    display: flex;
    flex-direction: row;
    position: relative;
    & .video-active-call {
      position: absolute;
      bottom: 0;
      left: 0;
      margin: 0 !important;
      padding: 5px 0;
    }
    & .buttons {
      display: flex;
      flex-direction: row;
      margin: auto;
      gap: 8px;

      @media (width < 800px) {
        margin: 0 0 0 auto;
      }
      & .fullscreen {
        background-color: rgba(255, 255, 255, 0.2);
        color: white;
      }
      & .fullscreen-media-disable {
        background: rgba(255, 77, 79, 0.2) !important;
      }
      & .fullscreen-disabled {
        background-color: rgba(255, 255, 255, 0.2) !important;
        color: var(--sui-gray-600) !important;
      }
      /* fix default spaceUI style for hover and active state */
      .sui-button.fullscreen:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
      .sui-button.fullscreen:active {
        background-color: rgba(255, 255, 255, 0.2);
      }
      .sui-button.fullscreen:focus {
        box-shadow: none;
      }
    }
  }

  .container-absolute {
    position: absolute;
    bottom: 0;
    width: 100%;
    margin-bottom: 16px;
  }

  /* animation styles for open and hide panel for fullscreen mode */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
