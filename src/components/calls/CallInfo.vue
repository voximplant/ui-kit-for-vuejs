<i18n>
{
  "en": {
    "incomingCall": "Incoming call",
    "statuses": {
      "pause": "Paused"
    },
    "errors": {
      "486": "Destination number is busy",
      "408": "Destination number is busy",
      "487": "Request terminated",
      "603": "Call was rejected",
      "404": "Invalid number",
      "480": "Destination number is unavailable",
      "402": "Insufficient funds",
      "ENDED": "Request terminated"
    }
  },
  "ru": {
    "incomingCall": "Входящий звонок",
    "statuses": {
      "pause": "Пауза"
    },
    "errors": {
      "486": "Набранный номер занят",
      "408": "Набранный номер занят",
      "487": "Вызов завершен",
      "603": "Вызов отклонен",
      "404": "Неверный номер",
      "480": "Номер недоступен",
      "402": "Недостаточно средств",
      "ENDED": "Вызов завершен"
    }
  }
}
</i18n>

<template lang="pug">
.call-info(v-if="callData" :class="{'expand-call-info-restrictions': settings.maximize}")
  .avatar-wrap
    Icon(color="--sui-gray-400" width="32px" name="ic24-user")
  .calls-wrap
    Typography.number.text(:fontColor="userColor ? '--sui-white' : '--sui-gray-900'") {{ callData?.number }}
    .status-wrap
      Typography.status.text(
        v-if="callData?.status === 'CONNECTED' && !callData.active && !incomingCall"
        fontColor="--sui-purple-500"
        ) {{ `${t('statuses.pause')}&nbsp; · &nbsp;` }}
      Typography.status.text.error(v-if="callData?.status !== 'CONNECTED' && callData?.status !== 'PROGRESSING' && !incomingCall") {{ errorText }}
      Typography.call-time.text(
        v-if="currentCallDuration && !incomingCall && callData?.status === 'CONNECTED'"
        fontColor="--sui-purple-500"
        ) {{ callData.active ? timeFormat(currentCallDuration.callDuration) : timeFormat(currentCallDuration.pauseDuration) }}
      Typography.call-time.text.animation(
        v-if="incomingCall"
        fontColor="--sui-gray-500"
        ) {{ t('incomingCall') }}
</template>

<script lang="ts">
  import { computed, defineComponent, PropType } from 'vue';
  import { Button, Icon, Typography } from '@voximplant/spaceui';
  import { $callDuration, activeCalls, CALL_STATUSES } from '@/store/calls';
  import { useStore } from 'effector-vue/composition';
  import { ActiveCall } from '@/types';
  import { timeFormat } from '@/lib/Helpers';
  import { useI18n } from 'vue-i18n';
  import { $settings } from '@/store/settings';

  export default defineComponent({
    name: 'CallInfo',
    components: { Typography, Button, Icon },
    props: {
      callData: {
        type: Object as PropType<ActiveCall>,
        required: true,
      },
      incomingCall: {
        type: Boolean,
        default: false,
      },
      activeCall: {
        type: Boolean,
        default: false,
      },
    },
    setup(props) {
      const duration = useStore($callDuration);
      const settings = useStore($settings);
      const calls = useStore(activeCalls);
      const { t } = useI18n();

      const currentCallDuration = computed(() => {
        if (!props.callData) return;
        const { id } = props.callData;
        return duration.value[id as string] || {};
      });
      const userColor = computed(() => props.incomingCall || settings.value.fullscreen);
      const errorText = computed(() =>
        CALL_STATUSES.includes(props.callData.status)
          ? t(`errors.${props.callData.status}`)
          : props.callData?.status
      );
      const callInfoWidth = computed(() => {
        if (!props.activeCall) return 'inherit';
        else if (calls.value.length - 1) return '57%';
        else return '85%';
      });

      return {
        t,
        currentCallDuration,
        timeFormat,
        userColor,
        errorText,
        callInfoWidth,
        settings,
      };
    },
  });
</script>

<style scoped>
  .expand-call-info-restrictions {
    max-width: 155px;
  }
  .call-info {
    align-items: center;
    display: flex;
    cursor: pointer;
    gap: 8px;
    width: v-bind('callInfoWidth');
    & .avatar-wrap {
      align-items: center;
      background-color: var(--sui-gray-100);
      border-radius: 50%;
      display: flex;
      height: 32px;
      justify-content: center;
      width: 32px;
    }
    & .avatar {
      height: 32px;
      width: 32px;
    }
    & .calls-wrap {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      max-width: 85%;
    }
    & .number {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    & .error {
      color: var(--sui-red-500);
    }
    & .text {
      display: block;
      font-size: 14px;
      line-height: 20px;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    & .status-wrap {
      display: flex;
      width: auto;
    }
  }
  .animation:after {
    overflow: hidden;
    display: inline-block;
    vertical-align: bottom;
    -webkit-animation: ellipsis steps(4, end) 1500ms infinite;
    animation: ellipsis steps(4, end) 1500ms infinite;
    content: '\2026'; /* ascii code for the ellipsis character */
    width: 0px;
  }
  @keyframes ellipsis {
    to {
      width: 12px;
    }
  }

  @-webkit-keyframes ellipsis {
    to {
      width: 12px;
    }
  }
</style>
