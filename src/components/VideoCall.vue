<template lang="pug">
.video-call(:class="{'video-call-minimize': settings.minimize, 'video-call-maximize': settings.maximize}")
  .wrap(id="video-container" v-show="!settings.minimize")
    .video-container(:class="getClass")
      .outgoing-video(v-show="!isLocalVideoMute" id="local-video" :class="outgoingVideoClasses")
      UserWithoutVideo(v-show="isLocalVideoMute" :class="outgoingBlockClasses" :isWindow="isWindowBlock")
      .incoming-video(v-show="!isRemoteVideoMute" id="remote-video" :class="incomingVideoClasses")
        .icon-mic-off(v-if="isRemoteMute" )
          Icon.icon-mute(
            color="--sui-white"
            name="ic24-mic-off"
            width="20"
            height="20"
          )
      UserWithoutVideo(v-show="isRemoteVideoMute" :class="incomingBlockClasses" :isWindow="!isWindowBlock")
    CallFooter(:isMaximize="settings.maximize")
  .call-wrap(v-if="settings.minimize" )
    .number
      Hint(
        :text="activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settings.minimize ? t(`errors.${activeCall?.status}`) : ''"
      )
        .number
          Icon.icon-error(
            v-if="activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settings.minimize"
            color="--sui-red-500"
            name="ic24-error-fill"
            width="20"
            height="20"
          )
          Typography.phone-number(:class="{'error' : activeCall?.status !== 'PROGRESSING' && activeCall?.status !== 'CONNECTED' && settings.minimize }") {{ activeCall?.number }}
    .status
      Typography.call-time(v-if="callDuration[activeCall?.id] && activeCall?.status === 'CONNECTED'") {{ activeCall.active ? timeFormat(callDuration[activeCall?.id].callDuration) : timeFormat(callDuration[activeCall?.id].pauseDuration) }}
      Loading.animation(v-if="!callDuration[activeCall?.id]")
  .call-buttons(v-if="settings.minimize")
    Button.call-button.button-end(
      mode="alert"
      iconOnly
      :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
      @click="() => hangUp({ id: activeCall?.id })"
    )
</template>

<script lang="ts">
  import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import { Button, generateCheckClickOutside, Hint, Icon, Typography } from '@voximplant/spaceui';
  import { useStore } from 'effector-vue/composition';
  import { $settings } from '@/store/settings';
  import { changeComponent, changeComponentDialingStatus } from '@/store/components';
  import {
    $callDuration,
    $calls,
    $currentActiveCallId,
    hangUp,
    currentActiveCall,
  } from '@/store/calls';
  import { $signInFields } from '@/store/signIn';
  import Loading from '@/components/animation/Loading.vue';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import DropdownList from '@/components/common/DropdownList.vue';
  import { changeVideoParam } from '@/lib/sdkSource';
  import UserWithoutVideo from '@/components/calls/UserWithoutVideo.vue';
  import CallFooter from '@/components/calls/CallFooter.vue';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';

  export default defineComponent({
    name: 'VideoCall',
    components: {
      DropdownList,
      CallInfo,
      Loading,
      Typography,
      Button,
      Icon,
      Hint,
      UserWithoutVideo,
      CallFooter,
    },
    setup() {
      const { t } = useI18n();
      const settings = useStore($settings);
      const activeCall = useStore(currentActiveCall);
      const signInStore = useStore($signInFields);
      const callDuration = useStore($callDuration);
      const showAdditionalButton = useStore(needToShowAdditionalButton);
      const allCalls = useStore($calls);
      const selectCalls = ref<HTMLDivElement | null>(null);
      const isOpenSelect = ref(false);
      const makeNewCall = () => {
        changeComponent('Dialing');
        changeComponentDialingStatus('newCall');
      };
      const currentActiveCallId = useStore($currentActiveCallId);
      const isRemoteVideoMute = computed(() => {
        if (!allCalls.value[currentActiveCallId.value]) {
          return true;
        }
        return !allCalls.value[currentActiveCallId.value]?.params.remoteVideo;
      });
      const isLocalVideoMute = computed(() => settings.value.videoMute);

      const checkClickOutsideCalls = generateCheckClickOutside(selectCalls);
      const onClickOutside = (event: MouseEvent) => {
        if (checkClickOutsideCalls(event) && isOpenSelect.value)
          isOpenSelect.value = !isOpenSelect.value;
      };
      const closeSelect = (event: KeyboardEvent) => {
        const isPushKey = event.key === 'Escape';
        if (isPushKey && isOpenSelect.value) isOpenSelect.value = false;
      };

      const incomingVideoClasses = computed(() => ({
        'show-all-container': !isRemoteVideoMute.value && !settings.value.maximize,
        'maximize-container': settings.value.maximize,
        'second-column': getClass.value['one-column-video'], // center when one column
      }));

      const incomingBlockClasses = computed(() => ({
        'show-all-container': isWindowBlock.value && !settings.value.maximize,
        'show-to-window':
          !isLocalVideoMute.value && isRemoteVideoMute.value && !settings.value.maximize,
        'hide-video':
          isLocalVideoMute.value &&
          isRemoteVideoMute.value &&
          !outgoingBlockClasses.value['hide-block'],
        'maximize-block': settings.value.maximize,
        'second-column': getClass.value['one-column-video'], // center when one column
      }));

      const outgoingVideoClasses = computed(() => ({
        'show-all-container':
          !isLocalVideoMute.value && isRemoteVideoMute.value && !settings.value.maximize,
        'show-to-window':
          !isLocalVideoMute.value && !isRemoteVideoMute.value && !settings.value.maximize,
        'maximize-container': settings.value.maximize,
      }));

      const outgoingBlockClasses = computed(() => ({
        'hide-block': isLocalVideoMute.value,
      }));
      const isRemoteMute = computed(() => allCalls.value[currentActiveCallId.value]?.params.muted);
      const isWindowBlock = computed(
        () =>
          isLocalVideoMute.value &&
          isRemoteVideoMute.value &&
          outgoingBlockClasses.value['hide-block']
      );

      const getClass = computed(() => ({
        'layout-local-video': activeCall.value?.status === 'CONNECTED' && !settings.value.maximize,
        'layout-remote-video': activeCall.value?.status !== 'CONNECTED' && !settings.value.maximize,
        'layout-maximize-video': settings.value.maximize,
        'one-column-video': settings.value.maximize && isLocalVideoMute.value,
        'two-column-video': !isLocalVideoMute.value && settings.value.maximize,
        sharing: settings.value.maximize && settings.value.sharing,
        'remote-sharing': settings.value.maximize && settings.value.remoteSharing,
        'full-sharing':
          settings.value.maximize && settings.value.remoteSharing && isLocalVideoMute.value,
        // TODO add store params remote sharing in store $calls param
      }));

      onMounted(() => {
        document.addEventListener('click', onClickOutside, { capture: true });
        document.addEventListener('keydown', closeSelect);
        let isLocalVideoEnable;
        if (activeCall.value) {
          isLocalVideoEnable =
            allCalls.value[activeCall.value?.id]?.call.settings.videoDirections.sendVideo;
          if (isLocalVideoEnable) changeVideoParam(true);
        }
      });

      onBeforeUnmount(() => {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('keydown', closeSelect);
        changeVideoParam(false);
      });

      return {
        t,
        settings,
        changeComponent,
        activeCall,
        signInStore,
        changeComponentDialingStatus,
        callDuration,
        showAdditionalButton,
        isOpenSelect,
        selectCalls,
        getClass,
        makeNewCall,
        isRemoteVideoMute,
        isLocalVideoMute,
        incomingVideoClasses,
        incomingBlockClasses,
        outgoingVideoClasses,
        outgoingBlockClasses,
        isWindowBlock,
        isRemoteMute,
        timeFormat,
        hangUp,
      };
    },
  });
</script>

<style>
  .video-call .incoming-video > video,
  .video-call .outgoing-video > video {
    border-radius: 8px;
    position: absolute;
    object-fit: cover;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .hidden {
    display: none;
  }
</style>

<style scoped>
  .show-all-container {
    align-items: center;
    border-radius: 8px;
    display: grid;
    height: auto;
    justify-content: center;
    text-align: center;
    width: auto;
  }
  .show-to-window {
    align-items: center;
    display: flex;
    height: 124px;
    justify-content: center;
    position: absolute;
    right: 16px;
    top: 16px;
    transition: all 0.2s ease-out;
    width: 157px;
    z-index: 1;
  }
  .hide-block {
    display: none;
  }
  .video-call-minimize {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .video-call-maximize {
    @media (385px < width < 1183px) {
      display: flex;
      justify-content: center;
      width: auto;
    }
  }
  .video-call {
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    overflow: scroll;
    padding: 16px 16px 24px;
    width: 100%;
    & .wrap {
      display: flex;
      flex-direction: column;
      height: 100%;
      justify-content: space-around;
    }
    & .video-container {
      align-items: center;
      border-radius: 8px;
      display: flex;
      position: relative;
    }
    /*& .incoming-video,
    & .outgoing-video {
      align-items: center;
      border-radius: 8px;
      display: flex;
      height: 100%;
      justify-content: center;
      width: 100%;
    }*/
    & .call-wrap {
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    & .phone-number {
      color: var(--sui-gray-900);
      display: block;
      font-size: 16px;
      line-height: 20px;
      margin-bottom: 4px;
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
    }
    & .buttons-container {
      align-items: center;
      display: flex;
      justify-content: center;
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
    & .button {
      height: 48px;
      width: 48px;
      &:not(:last-child) {
        margin-right: 16px;
      }
    }
    & .button-big {
      width: fit-content;
    }
    & .avatar-wrap {
      align-items: center;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 64px;
      justify-content: center;
      margin-bottom: 24px;
      position: relative;
      width: 64px;
    }
    & .icon-mic-off {
      bottom: 16px;
      position: absolute;
      right: 16px;
      display: flex;
      background-color: var(--sui-red-500);
      width: 28px;
      height: 28px;
      border-radius: 14px;
      & .icon-mute {
        margin: auto;
      }
    }
    & .layout-remote-video {
      flex-direction: column;
      height: 296px;
      justify-content: center;
      margin-bottom: 16px;
      /*width: 349px;*/
    }
    & .layout-local-video {
      flex-direction: column;
      height: 296px;
      justify-content: center;
      margin-bottom: 16px;
      /*width: 349px;*/
      .incoming-video {
        grid-column: 1;
      }
    }
    .layout-maximize-video {
      display: grid;
      grid-auto-flow: column;
      width: 100%;
      height: auto;
      gap: 16px;
      margin-bottom: 16px;
      .outgoing-video {
        grid-column: 2;
        @media (width < 1183px) {
          grid-column: 1;
        }
      }
      @media (width < 1183px) {
        display: grid;
        grid-auto-flow: row;
      }
    }
    .one-column-video {
      grid-template-columns: 25% 50% 25%;
    }
    .two-column-video {
      grid-template-columns: 50% 50%;
      @media (width < 1183px) {
        grid-template-columns: 100% !important;
        grid-template-rows: 50% 50% !important;
      }
    }
    .sharing {
      grid-template-columns: 70% 29%;
      .outgoing-video {
        grid-column: 1 !important;
      }
    }
    .remote-sharing {
      grid-template-columns: 70% 29%;
    }
    .full-sharing {
      grid-template-columns: 100%;
      .incoming-video {
        grid-column: 1 !important;
      }
    }
    .second-column {
      grid-column: 2;
    }
    .maximize-container {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 */
      display: grid;
      grid-auto-flow: column;
      position: relative;
      overflow: hidden;
      object-fit: contain;
      border-radius: 8px;
      margin: auto;
    }
    .maximize-block {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%;
      top: 0;
      right: 0;
      background: #2e283d;
      border-radius: 8px;
      margin: auto;
      display: flex;
      position: relative;
    }
    & .transform {
      transform: rotate(180deg);
      transition: transform 0.1s ease-out;
    }
  }
</style>
