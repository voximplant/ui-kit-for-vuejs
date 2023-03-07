<template lang="pug">
.video-call(:class="{'video-call-minimize': settings.minimize, 'video-call-maximize': settings.maximize}")
  .wrap(id="video-container" v-show="!settings.minimize" :class="{'black-background': settings.fullscreen }")
    .video-container(:class="videoContainerClasses")
      DraggableBlock(ref="draggable" v-show="!isLocalVideoMute && !settings.maximize" :isRemoteVideoMute="isRemoteVideoMute")
      Teleport(v-if="isTeleportVideo" to=".draggable-video" :disabled="needTeleport")
        .outgoing-video(v-show="!isLocalVideoMute" id="local-video" :class="outgoingVideoClasses")
          .stub
      UserWithoutVideo(v-show="isLocalVideoMute" :class="outgoingBlockClasses" :isWindow="isWindowBlock" :show-loading="!isCallConnected")
      .incoming-video(v-show="!isRemoteVideoMute" id="remote-video" :class="incomingVideoClasses")
        .icon-mic-off(v-show="isRemoteMute")
          Icon.icon-mute(
            color="--sui-white"
            name="ic24-mic-off"
            width="20"
            height="20"
          )
      UserWithoutVideo(v-show="isRemoteVideoMute" :class="incomingBlockClasses" :isWindow="!isWindowBlock" :show-loading="!isCallConnected")
    VideoCallFooter(:isMaximize="settings.maximize")
  .call-wrap(v-if="settings.minimize")
    Typography.phone-number {{ selectCall?.number }}
  Typography.call-time(v-if="settings.minimize && callDuration[selectCall?.id] && selectCall?.status === 'CONNECTED'") {{ selectCall.active ? timeFormat(callDuration[selectCall?.id].callDuration) : timeFormat(callDuration[selectCall?.id].pauseDuration) }}
  .call-buttons(v-if="settings.minimize")
    Loading.animation(v-if="selectCall?.status !== 'CONNECTED'")
    Button.call-button.button-end(
      mode="alert"
      iconOnly
      :icon="{name: 'ic20-phone-missed', color: '--sui-white'}"
      @click="() => hangUp({ id: selectCall.id })"
    )
</template>

<script lang="ts">
  import { computed, defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { Button, Icon, Typography } from '@voximplant/spaceui';
  import { useStore } from 'effector-vue/composition';
  import { $settings } from '@/store/settings';
  import {
    $callDuration,
    $calls,
    hangUp,
    currentSelectCall,
    $currentSelectCallId,
  } from '@/store/calls';
  import Loading from '@/components/animation/Loading.vue';
  import { changeVideoParam } from '@/lib/sdkSource';
  import UserWithoutVideo from '@/components/calls/UserWithoutVideo.vue';
  import VideoCallFooter from '@/components/calls/VideoCallFooter.vue';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';
  import DraggableBlock from '@/components/DraggableBlock.vue';

  export default defineComponent({
    name: 'VideoCall',
    components: {
      Loading,
      Typography,
      Button,
      Icon,
      UserWithoutVideo,
      VideoCallFooter,
      DraggableBlock,
    },
    setup() {
      const { t } = useI18n();
      const settings = useStore($settings);
      const callDuration = useStore($callDuration);
      const allCalls = useStore($calls);
      const currentSelectCallId = useStore($currentSelectCallId);
      const selectCall = useStore(currentSelectCall);
      const draggable = ref<HTMLDivElement | null>(null);
      const isTeleportVideo = ref(false);

      watch(draggable, () => {
        isTeleportVideo.value = true;
      });

      // flags
      const isCallConnected = computed(() => {
        return allCalls.value[currentSelectCallId.value]?.call.signalingConnected;
      });
      const isRemoteVideoMute = computed(() => {
        if (
          !allCalls.value[currentSelectCallId.value] ||
          !isCallConnected.value ||
          !selectCall.value?.active ||
          allCalls.value[selectCall.value?.id]?.params.remotePausedState
        ) {
          return true;
        }
        return !allCalls.value[currentSelectCallId.value]?.params.remoteVideo;
      });
      const isLocalVideoMute = computed(
        () => settings.value.videoMute || !selectCall.value?.active
      );
      const isRemoteMute = computed(() => allCalls.value[currentSelectCallId.value]?.params.muted);
      const isWindowBlock = computed(
        () =>
          isLocalVideoMute.value &&
          isRemoteVideoMute.value &&
          outgoingBlockClasses.value['hide-block']
      );
      const needTeleport = computed(() => {
        return (
          (!isLocalVideoMute.value && isRemoteVideoMute.value && !settings.value.maximize) ||
          settings.value.maximize
        );
      });

      // classes
      const incomingVideoClasses = computed(() => ({
        'show-all-container': !isRemoteVideoMute.value && !settings.value.maximize,
        'maximize-container': settings.value.maximize,
        'second-column': videoContainerClasses.value['one-column-video'], // center when one column
      }));

      const incomingBlockClasses = computed(() => ({
        'show-all-container': isWindowBlock.value && !settings.value.maximize,
        'show-to-window':
          !isLocalVideoMute.value && isRemoteVideoMute.value && !settings.value.maximize,
        'hide-video':
          isLocalVideoMute.value &&
          isRemoteVideoMute.value &&
          !outgoingBlockClasses.value['hide-block'],
        'maximize-block': settings.value.maximize && !settings.value.sharing,
        'maximize-block_sharing': settings.value.maximize && settings.value.sharing,
        'second-column': videoContainerClasses.value['one-column-video'], // center when one column
      }));

      const outgoingVideoClasses = computed(() => ({
        'show-all-container':
          !isLocalVideoMute.value && isRemoteVideoMute.value && !settings.value.maximize,
        'maximize-container': settings.value.maximize,
      }));

      const outgoingBlockClasses = computed(() => ({
        'hide-block': isLocalVideoMute.value,
      }));

      const videoContainerClasses = computed(() => ({
        'layout-local-video': selectCall.value?.status === 'CONNECTED' && !settings.value.maximize,
        'layout-remote-video': selectCall.value?.status !== 'CONNECTED' && !settings.value.maximize,
        'layout-maximize-video': settings.value.maximize,
        'layout-full-screen': settings.value.fullscreen,
        'one-column-video': settings.value.maximize && isLocalVideoMute.value,
        'two-column-video':
          !isLocalVideoMute.value && settings.value.maximize && !settings.value.sharing,
        sharing: settings.value.maximize && settings.value.sharing,
        'remote-sharing': settings.value.maximize && settings.value.remoteSharing,
        'full-sharing':
          settings.value.maximize && settings.value.remoteSharing && isLocalVideoMute.value,
      }));
      // local and remote video object fit computed
      const videoObjectFit = computed(() =>
        settings.value.maximize || settings.value.sharing ? 'contain' : 'cover'
      );
      const incomingVideoObjectFit = computed(() =>
        settings.value.remoteSharing ? 'contain' : 'cover'
      );

      onMounted(() => {
        let isLocalVideoEnable;
        if (selectCall.value) {
          isLocalVideoEnable =
            allCalls.value[selectCall.value?.id]?.call.settings.videoDirections.sendVideo;
          if (isLocalVideoEnable) changeVideoParam(true);
        }
      });

      onBeforeUnmount(() => {
        changeVideoParam(false);
      });

      return {
        t,
        settings,
        selectCall,
        callDuration,
        isRemoteVideoMute,
        isLocalVideoMute,
        videoContainerClasses,
        incomingVideoClasses,
        incomingBlockClasses,
        outgoingVideoClasses,
        outgoingBlockClasses,
        isWindowBlock,
        isRemoteMute,
        timeFormat,
        hangUp,
        draggable,
        isTeleportVideo,
        needTeleport,
        isCallConnected,
        videoObjectFit,
        incomingVideoObjectFit,
      };
    },
  });
</script>

<style>
  .video-call .incoming-video > video,
  .video-call .outgoing-video > video {
    border-radius: 8px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .video-call .incoming-video > video {
    object-fit: v-bind('incomingVideoObjectFit');
    background-color: var(--sui-gray-700);
  }
  .video-call .outgoing-video > video {
    object-fit: v-bind('videoObjectFit');
    background-color: var(--sui-gray-700);
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
    z-index: 15; /* z-index 11-15: draggable local video & video in small window */
  }
  .hide-block {
    display: none;
  }
  .video-call-minimize {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 16px;
  }
  .video-call-maximize {
    @media (385px < width < 1183px) {
      display: flex;
      justify-content: center;
      width: auto;
    }
  }
  /* styles used when dragging video stub   */
  .dragging-style {
    .stub {
      visibility: visible;
      width: 100%;
      height: 100%;
      background: #36cfc9;
      opacity: 0.8;
      border-radius: 8px;
    }
  }
  .video-call {
    align-items: center;
    box-sizing: border-box;
    height: 100%;
    overflow: hidden; /* remove scroll for windows OS */
    padding: 16px;
    width: 100%;
    & .wrap {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      width: inherit;
      justify-content: space-between;
    }
    & .black-background {
      background-color: black; /* fullscreen backdrop for Safari */
    }
    & .video-container {
      align-items: center;
      border-radius: 8px;
      display: flex;
      position: relative;
      height: inherit;
    }
    & .call-wrap {
      align-items: center;
      width: 75%;
      overflow: hidden;
    }
    & .call-buttons {
      display: flex;
      flex-direction: row;
      gap: 16px;
      .animation {
        margin: auto;
      }
    }
    & .phone-number {
      color: var(--sui-gray-900);
      display: block;
      font-size: 16px;
      line-height: 20px;
      white-space: nowrap;
      width: initial;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & .call-time {
      color: var(--sui-purple-500);
      display: block;
    }
    & .status {
      display: flex;
    }
    & .button {
      height: 48px;
      width: 48px;
      &:not(:last-child) {
        margin-right: 16px;
      }
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
      z-index: 5; /* z-index 1-10: style elements */
      & .icon-mute {
        margin: auto;
      }
    }
    & .layout-remote-video {
      flex-direction: column;
      height: 296px;
      justify-content: center;
      margin-bottom: 16px;
    }
    & .layout-local-video {
      flex-direction: column;
      height: 296px;
      justify-content: center;
      margin-bottom: 16px;
      .incoming-video {
        grid-column: 1;
      }
    }
    .layout-maximize-video {
      display: grid;
      grid-auto-flow: column;
      height: inherit;
      .outgoing-video {
        object-fit: contain;
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
    .layout-full-screen {
      padding: 16px !important;
    }
    .one-column-video {
      grid-template-columns: 2% 94% 2%;
    }
    .two-column-video {
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      @media (width < 1183px) {
        grid-template-columns: 100% !important;
        grid-template-rows: 50% 50% !important;

        width: 100%;
        height: inherit;
        margin: auto;
        gap: 0 !important;
      }
    }
    .sharing {
      height: 100%;
      position: relative;
      background-color: var(--sui-gray-800);
      .incoming-video {
        position: absolute;
        width: 157px;
        height: 124px;
        top: 16px;
        right: 16px;
        padding-bottom: 0 !important;
      }
      .outgoing-video {
        object-fit: contain;
        display: contents;
        position: absolute;
        width: 100%;
        height: 100%;
      }
    }
    .remote-sharing {
      .incoming-video {
        object-fit: contain;
        display: contents;
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .outgoing-video {
        position: absolute;
        width: 157px;
        height: 124px;
        top: 16px;
        right: 16px;
        padding-bottom: 0 !important;
        z-index: 1;
      }
    }
    .full-sharing {
      grid-template-columns: 100%;
      .incoming-video {
        grid-column: 1 !important;
      }
    }
    .second-column {
      grid-column: 2;
      padding: 0 !important;
      height: 100% !important;
      @media (width < 1183px) {
        padding: 0 !important;
      }
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

      @media (635px < width < 1183px) {
        width: 603px;
        height: calc(100% - 8px);
        padding: 0 !important;
      }
      @media (width < 635px) {
        width: inherit;
      }
    }
    .maximize-block_sharing {
      position: absolute;
      width: 157px;
      height: 124px;
      top: 16px;
      right: 16px;
      padding-bottom: 0 !important;
    }
    .maximize-block {
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 */
      top: 0;
      right: 0;
      background: #2e283d;
      border-radius: 8px;
      margin: auto;
      display: flex;
      position: relative;

      @media (635px < width < 1183px) {
        width: 603px;
        height: calc(100% - 8px);
        padding: 0 !important;
      }
      @media (width < 635px) {
        width: 100%;
      }
    }
  }
</style>
