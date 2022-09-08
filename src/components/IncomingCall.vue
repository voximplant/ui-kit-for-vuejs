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
    :callData="incomingCall[0]"
  )
  Hint.hint-number(:text="incomingCall.length > 26 ? incomingCall[0].number : ''")
    Typography.title-number(v-if="settingsState.minimize" fontColor="--sui-green-900") {{ incomingCall[0].number }}
  .button-wrap(:class="buttonWrapClasses")
    Loading(v-if="settingsState.minimize")
    Hint.hint-button(:text="t('hints.decline')")
      Button.button.close(
        mode="alert"
        iconOnly
        :icon="{name: 'ic20-close', color: '--sui-white'}"
        @click="hangUp({ id: incomingCall[0].id, incoming: true })"
      )
    Hint.hint-button(v-if="isVideoCall" :text="t('hints.answerVideo')")
      Button.button.take-call(
        mode="primary"
        iconOnly
        :icon="{ spriteUrl: '/static/icons-pack.svg', name: 'ic24-videocamera' }"
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
  import { $settings } from '@/store/settings/index';
  import { useStore } from 'effector-vue/composition';
  import { useI18n } from 'vue-i18n';
  import Loading from '@/components/animation/Loading.vue';
  import {
    $callDuration,
    incomingCalls,
    answerIncomingCall,
    hangUp,
    $calls,
    toggleLocalVideo,
  } from '@/store/calls';
  import { changeVideoParam } from '@/lib/sdkSource';

  export default defineComponent({
    name: 'IncomingCall',
    components: { Loading, CallInfo, Typography, Button, Icon, Hint },
    setup() {
      const { t } = useI18n();
      const settingsState = useStore($settings);
      const duration = useStore($callDuration);
      const calls = useStore($calls);
      const incomingCall = useStore(incomingCalls);

      let isVideoCall = false;
      if (incomingCall.value[0]?.id) {
        isVideoCall = calls.value[incomingCall.value[0]?.id]?.params.video;
      }
      const buttonWrapClasses = computed(() => ({
        video: isVideoCall,
        audio: !isVideoCall,
      }));

      const answerCall = (isVideo: boolean) => {
        if (incomingCall.value[0]) {
          toggleLocalVideo({ id: incomingCall.value[0].id, status: isVideo });
          changeVideoParam(isVideo);
          //changeVideoMute(!$settings.getState().videoMute);
        }
        //changeVideoParam(isVideo);
        answerIncomingCall({ id: incomingCall.value[0].id, isVideo });
      };

      return {
        t,
        incomingCall,
        hangUp,
        settingsState,
        answerIncomingCall,
        duration,
        buttonWrapClasses,
        isVideoCall,
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
    z-index: 20;
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
