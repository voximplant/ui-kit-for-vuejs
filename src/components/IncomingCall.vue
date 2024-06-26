<i18n>
{
  "en": {
    "incomingCall": "Incoming call...",
    "hints": {
      "answer": "Answer",
      "answerVideo": "Answer with video",
      "decline": "Decline"
    }
  },
  "ru": {
    "incomingCall": "Входящий звонок...",
    "hints": {
      "answer": "Ответить",
      "answerVideo": "Ответить с видео",
      "decline": "Отклонить"
    }
  }
}
</i18n>

<template lang="pug">
.incoming-call(:class="{'incoming-call-collapse': settingsState.minimize}")
  CallInfo(
    v-if="!settingsState.minimize"
    :incomingCall="true"
    :callData="currentIncomingCall"
  )
  Hint.hint-number(:text="incomingCallsStore.length > 26 ? currentIncomingCall.number : ''")
    Typography.title-number(v-if="settingsState.minimize" fontColor="--sui-green-900") {{ currentIncomingCall.number }}
  .button-wrap(:class="buttonWrapClasses")
    Loading(v-if="settingsState.minimize")
    Hint.hint-button(:text="t('hints.decline')")
      Button.button.close(
        mode="alert"
        iconOnly
        :icon="{name: 'ic20-close', color: '--sui-white'}"
        @click="hangUp({ id: currentIncomingCall.id })"
      )
    Hint.hint-button(v-if="currentIncomingCall.video" :text="t('hints.answerVideo')")
      Button.button.take-call(
        mode="primary"
        iconOnly
        :icon="{ spriteUrl: 'static/icons-pack.svg', name: 'ic24-videocamera' }"
        @click="answerCall(true)"
      )
    Hint.hint-button(:text="t('hints.answer')")
      Button.button.take-call(
        mode="primary"
        iconOnly
        :icon="{name: 'ic20-phone', color: '--sui-white'}"
        @click="answerCall(false)"
      )
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Button, Hint, Icon, Typography } from '@voximplant/spaceui';
  import CallInfo from '@/components/calls/CallInfo.vue';
  import { $settings, changeVideoMute } from '@/store/settings/index';
  import { useStore } from 'effector-vue/composition';
  import { useI18n } from 'vue-i18n';
  import Loading from '@/components/animation/Loading.vue';
  import {
    $callDuration,
    incomingCalls,
    answerIncomingCall,
    hangUp,
    toggleLocalVideo,
    setCurrentCallAsPaused,
    $currentActiveCallId,
  } from '@/store/calls';
  import { changeVideoParam } from '@/lib/sdkSource';
  import appConfig from '@/config';
  import { debounce } from '@/helper/debounce';

  export default defineComponent({
    name: 'IncomingCall',
    components: { Loading, CallInfo, Typography, Button, Icon, Hint },
    setup() {
      const { t } = useI18n();
      const settingsState = useStore($settings);
      const duration = useStore($callDuration);
      const incomingCallsStore = useStore(incomingCalls);
      const currentActiveCallId = useStore($currentActiveCallId);
      const currentIncomingCall = computed(() => incomingCallsStore.value[0]);

      const buttonWrapClasses = computed(() => ({
        video: currentIncomingCall.value.video,
        audio: !currentIncomingCall.value.video,
      }));

      const answerCall = debounce((isVideo: boolean) => {
        if (currentActiveCallId.value) {
          setCurrentCallAsPaused({})
            .then(() => answer(isVideo))
            .catch((error) => console.error('setCurrentCallAsPaused error', error));
        } else {
          answer(isVideo);
        }
      }, 600);

      const answer = (isVideo: boolean) => {
        if (currentIncomingCall.value) {
          toggleLocalVideo({ id: currentIncomingCall.value.id, status: isVideo });
          if (settingsState.value.videoMute !== isVideo) changeVideoParam(isVideo);
          else changeVideoMute(!isVideo);
        }
        answerIncomingCall({ id: currentIncomingCall.value.id, isVideo });
      };

      return {
        t,
        incomingCallsStore,
        currentIncomingCall,
        hangUp,
        settingsState,
        answerIncomingCall,
        duration,
        buttonWrapClasses,
        appConfig,
        answerCall,
      };
    },
  });
</script>

<style scoped>
  .incoming-call {
    align-items: center;
    background-color: var(--sui-purple-900);
    border-radius: 8px;
    box-sizing: border-box;
    display: flex;
    height: fit-content;
    justify-content: space-between;
    padding: 16px;
    position: absolute;
    top: 16px;
    width: calc(100% - 48px);
    z-index: 20; /* z-index 16-20: dropdown call list & incoming call  */
    max-width: 557px;
    & .button-wrap {
      display: grid;

      &.audio {
        grid-gap: 16px;
        grid-template-columns: 1fr 1fr;
      }
      &.video {
        grid-gap: 8px;
        grid-template-columns: 1fr 1fr 1fr;
      }
    }
    .take-call {
      background-color: var(--sui-green-500);
      &:hover:enabled,
      &:active:enabled {
        background-color: var(--sui-green-600);
      }
    }
    & .hint-button {
      width: 40px;
    }
    & .title-number {
      display: block;
      max-width: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .incoming-call-collapse {
    background-color: transparent;
    border-radius: 0;
    position: static;
    width: 100%;
    & .button-wrap {
      align-items: center;
      &.audio {
        grid-gap: 16px;
        grid-template-columns: max-content 1fr 1fr;
      }
      &.video {
        grid-gap: 8px;
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
    }
    & .time {
      color: var(--sui-purple-500);
    }
  }
</style>
