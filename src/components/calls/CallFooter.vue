<i18n>
{
  "en": {
    "buttons": {
      "end": "End call",
      "transfer": "Transfer"
    },
    "statuses": {
      "pause": "Paused",
      "error": "Connection failed"
    }
  },
  "ru": {
    "buttons": {
      "end": "Завершить звонок",
      "transfer": "Перевести звонок"
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
    :icon="settings.mute ? 'ic24-mic-off' : 'ic24-mic'"
    :mode="settings.mute ? 'alert' : 'outlined'"
    @click="changeMute(!settings.mute);"
  )
  Button.button(
    iconOnly
    :disabled="settings.sharing"
    size="l"
    :icon="{ spriteUrl: '/static/icons-pack.svg', name: settings.videoMute ? 'ic24-videocamera-off' : 'ic24-videocamera' }"
    :mode="settings.videoMute ? 'alert' : 'outlined'"
    @click="toggleVideo"
  )
  Button.button(
    v-if="activeCall"
    mode="outlined"
    iconOnly
    size="l"
    :icon="activeCall.active ? 'ic24-pause' : 'ic24-play'"
    @click="() => { toggleCallActive({ id: activeCall.id }) }"
  )
  Button.fullscreen.button(
    v-if="activeCall"
    mode="outlined"
    iconOnly
    size="l"
    :icon="{ spriteUrl: '/static/icons-pack.svg', name: settings.sharing ? 'ic24-sharing-stop' : 'ic24-sharing'}"
    @click="toggleSharing"
  )
  Button.button(
    iconOnly
    size="l"
    :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
    mode="outlined"
    @click="() => { changeComponent('Dialing'); changeComponentDialingStatus('toneDial') }"
  )
  Button.button(
    iconOnly
    size="l"
    :icon="{ spriteUrl: '/static/icons-pack.svg', name: 'ic24-phone-new' }"
    mode="outlined"
    @click="makeNewCall"
  )
.buttons-container(v-if="!isMaximize")
  Button.button.button-big(
    size="l"
    :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
    mode="alert"
    @click="() => hangUp({ id: activeCall.id })"
  ) {{ t('buttons.end') }}
  Button.button.button-big(
    v-if="showAdditionalButton"
    mode="flat"
    ref="selectCalls"
    @click="isOpenSelect = !isOpenSelect"
  ) {{ t('buttons.transfer') }}
    Icon.icon-transfer(
      v-if="calls > 48"
      name="ic12-arrow-down"
      color="--sui-purple-500"
      width="12"
      height="12"
      :class="{'transform': isOpenSelect}"
    )
  transition(name="fade")
    DropdownList.transfer-dropdown(v-if="isOpenSelect")
      ul.select-list
        li.list-item(
          v-for="(item, key) in calls"
          :key="key"
          @click="transferCall(item.id)"
        )
          CallInfo(:callData="item")
transition(name="fade")
  .buttons-maximize-container(
    v-if="isMaximize && showFooter"
    :class="{'container-absolute': settings.fullscreen}"
  )
    ActiveCall
    .buttons(:class="{'full-screen': settings.fullscreen}")
      Button(
        iconOnly
        size="l"
        :icon="settings.mute ? 'ic24-mic-off' : 'ic24-mic'"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        @click="changeMute(!settings.mute);"
      )
      Button(
        iconOnly
        size="l"
        :disabled="settings.sharing"
        :icon="{ spriteUrl: '/static/icons-pack.svg', name: settings.videoMute ? 'ic24-videocamera-off' : 'ic24-videocamera' }"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        @click="toggleVideo"
      )
      Button(
        v-if="activeCall"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :icon="activeCall.active ? 'ic24-pause' : 'ic24-play'"
        @click="() => { toggleCallActive({ id: activeCall.id }) }"
      )
      Button(
        v-if="activeCall"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :icon="{ spriteUrl: '/static/icons-pack.svg', name: settings.sharing ? 'ic24-sharing-stop' : 'ic24-sharing'}"
        @click="toggleSharing"
      )
      Button(
        iconOnly
        size="l"
        :icon="{name: 'ic20-numbers', width: '20px', height: '20px'}"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        @click="() => { changeComponent('Dialing'); changeComponentDialingStatus('toneDial') }"
      )
      Button(
        iconOnly
        size="l"
        :icon="{ spriteUrl: '/static/icons-pack.svg', name: 'ic24-phone-new' }"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        @click="makeNewCall"
      )
      Button(
        v-if="activeCall"
        :class="{'fullscreen': settings.fullscreen, 'button': !settings.fullscreen}"
        :mode="!settings.fullscreen && 'outlined'"
        iconOnly
        size="l"
        :icon="{name: settings.fullscreen ? 'ic24-fullscreen-exit' : 'ic24-fullscreen'}"
        @click="openFullScreen"
      )
      Button.button.button-big(
        size="l"
        :icon="{name: 'ic24-close', color: '--sui-white'}"
        mode="alert"
        @click="() => hangUp({ id: activeCall.id })"
      )
</template>

<script lang="ts">
  import { defineComponent, ref, watch } from 'vue';
  import { Button, generateCheckClickOutside, Hint, Icon, Typography } from '@voximplant/spaceui';
  import DropdownList from '@/components/common/DropdownList.vue';
  import ActiveCall from '@/components/calls/ActiveCall.vue';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import Loading from '@/components/animation/Loading.vue';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition';
  import { $settings, changeMute, toggleFullScreen, toggleSharingVideo } from '@/store/settings';
  import {
    currentActiveCall,
    toggleCallActive,
    hangUp,
    toggleLocalVideo,
    activeCalls,
    transferCall,
    toggleRemoteSharingVideo,
  } from '@/store/calls';
  import { changeVideoParam } from '@/lib/sdkSource';
  import { changeComponent, changeComponentDialingStatus } from '@/store/components';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';

  export default defineComponent({
    name: 'CallFooter',
    components: {
      DropdownList,
      ActiveCall,
      CallInfo,
      Loading,
      Typography,
      Button,
      Icon,
      Hint,
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
      const calls = useStore(activeCalls);
      const activeCall = useStore(currentActiveCall);
      const isOpenSelect = ref(false);
      const selectCalls = ref<HTMLDivElement | null>(null);
      const checkClickOutsideCalls = generateCheckClickOutside(selectCalls);
      const showAdditionalButton = useStore(needToShowAdditionalButton);
      const showFooter = ref(true);
      let isTimerEnable = false;
      let timer: ReturnType<typeof setTimeout>;

      const changeShowFooter = (param: boolean) => {
        showFooter.value = param;
      };

      const resetTimer = () => {
        if (!showFooter.value) changeShowFooter(true);
        clearTimeout(timer);
        timer = setTimeout(() => changeShowFooter(false), 3000);
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

      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutsideCalls(event) && isOpenSelect.value)
          isOpenSelect.value = !isOpenSelect.value;
      };
      const closeSelect = (event: KeyboardEvent) => {
        const isPushKey = event.key === 'Escape';
        if (isPushKey && isOpenSelect.value) isOpenSelect.value = false;
      };
      const toggleVideo = () => {
        if (activeCall.value) {
          toggleLocalVideo({ id: activeCall.value?.id, status: !!settings.value.videoMute });
          changeVideoParam(!!settings.value.videoMute);
        }
      };
      const toggleSharing = () => {
        if (activeCall.value) {
          toggleRemoteSharingVideo({ id: activeCall.value?.id, status: !settings.value.sharing });
          toggleSharingVideo(!settings.value.sharing);
        }
      };
      const makeNewCall = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('newCall');
      };
      const openFullScreen = () => {
        const videoElement = document.getElementById('video-container');
        if (!videoElement) return;

        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          videoElement?.requestFullscreen();
        }
        videoElement.addEventListener('fullscreenchange', () => {
          toggleFullScreen(!!document.fullscreenElement);
        });
      };

      return {
        t,
        settings,
        calls,
        activeCall,
        showAdditionalButton,
        isOpenSelect,
        toggleVideo,
        transferCall,
        toggleCallActive,
        hangUp,
        onClickOutside,
        closeSelect,
        changeMute,
        makeNewCall,
        changeComponent,
        changeComponentDialingStatus,
        toggleSharing,
        openFullScreen,
        showFooter,
      };
    },
  });
</script>

<style scoped>
  .buttons-container {
    align-items: center;
    display: flex;
    justify-content: center;

    &:not(:last-child) {
      margin-bottom: 20px;
    }

    & .button {
      height: 48px;
      width: 48px;

      &:not(:last-child) {
        margin-right: 8px;
      }
    }

    & .button-big {
      width: fit-content;
    }
  }

  .buttons-maximize-container {
    display: flex;
    flex-direction: row;
    position: relative;
  }

  .container-absolute {
    position: absolute;
    bottom: 0;
    width: 100%;
  }

  .buttons {
    display: flex;
    flex-direction: row;
    margin: auto;
    gap: 8px;
    .fullscreen {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .sui-button.fullscreen:hover {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .sui-button.fullscreen:active {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .sui-button.fullscreen:focus {
      box-shadow: none;
    }
  }
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
