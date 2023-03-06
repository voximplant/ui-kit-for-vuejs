<i18n>
{
  "en": {
    "callEndedTitle": "The call was ended",
    "outbound": "Outbound Call",
    "incoming": "Incoming Call",
    "cancel": "Cancel",
    "redial": "Redial",
    "duration": "Duration",
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
    "callEndedTitle": "Вызов был завершен",
    "outbound": "Исходящий звонок",
    "incoming": "Входящий звонок",
    "cancel": "Отмена",
    "redial": "Повтор",
    "duration": "Продолжительность",
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
.call-ended(v-if="!settingsState?.minimize")
  Typography.title(v-if="showError") {{ t(`${selectCall.direction}`) }}
  Typography.title(v-else) {{ t('callEndedTitle') }}
  .info-wrap
    .avatar-wrap
      Icon(
        color="--sui-gray-400"
        name="ic24-user"
        width="42"
        height="46"
      )
    .text-wrap(v-if="selectCall")
      Typography.phone-number {{ selectCall.number }}
      Typography.duration(v-if="!showError") {{ t('duration') }}: {{ callTime }}
      .error-container(v-if="showError")
        Icon(
          color="--sui-red-500"
          name="ic24-error-fill"
          width="20"
          height="20"
        )
        Typography(fontColor="--sui-red-500") {{ selectCall.status }} &middot; {{ errorText }}
  .call-buttons
    Button(
      mode="success"
      @click="redialCall"
    ) {{ t('redial') }}
    Button(
      mode="flat"
      @click="closeSelectCall"
    ) {{ t('cancel') }}
.call-collapsed(v-else)
  Hint.hint-phone(:class="{'error-text': showError}" :text="showError ? errorText : selectCall.number")
    .error-text-wrap
      Icon(
        v-if="showError"
        color="--sui-red-500"
        name="ic24-error-fill"
        width="20"
        height="20"
      )
      Typography.phone-number(v-if="selectCall" :fontColor="showError && '--sui-red-500'") {{ selectCall.number }}
  .call-buttons
    Hint(:text="t('cancel')")
      Button(
        mode="secondary"
        iconOnly
        :icon="{name: 'ic20-close', color: '--sui-gray-700'}"
        @click="closeSelectCall"
      )
    Hint(:text="t('redial')")
      Button(
        mode="success"
        :icon="{ name: 'ic20-phone', color: '--sui-white' }"
        iconOnly
        @click="redialCall"
      )
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import {
    $callDuration,
    $currentActiveCallId,
    $lastCallNumber,
    CALL_STATUSES,
    createCall,
    currentSelectCall,
    setSelectCall,
  } from '@/store/calls';
  import { useStore } from 'effector-vue/composition';
  import { Button, Hint, Icon, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { timeFormat } from '@/lib/Helpers';
  import { $settings } from '@/store/settings';
  import appConfig from '@/config';

  export default defineComponent({
    name: 'CallEnded',
    components: {
      Icon,
      Typography,
      Button,
      Hint,
    },
    setup() {
      const { t } = useI18n();
      const selectCall = useStore(currentSelectCall);
      const callDuration = useStore($callDuration);
      const settingsState = useStore($settings);
      const currentActiveCallId = useStore($currentActiveCallId);
      const closeSelectCall = () => {
        setSelectCall(currentActiveCallId.value || ''); // open active call or open dialing view
      };
      const callTime = ref(
        selectCall.value && callDuration.value[selectCall.value?.id]
          ? timeFormat(callDuration.value[selectCall.value?.id]?.callDuration)
          : '' // call failed
      );
      const redialCall = () => {
        createCall({
          number: $lastCallNumber.getState(),
          video: !appConfig.AUDIO_ONLY,
        });
      };
      const errorText = computed(() => {
        if (selectCall.value && CALL_STATUSES.includes(selectCall.value?.status)) {
          return settingsState.value.minimize
            ? selectCall.value?.status + ' • ' + t(`errors.${selectCall.value?.status}`)
            : t(`errors.${selectCall.value?.status}`);
        } else {
          return selectCall.value?.status;
        }
      });
      const showError = computed(
        () => selectCall.value?.status !== 'ENDED' && errorText.value !== 'CONNECTED'
      );

      return {
        t,
        redialCall,
        selectCall,
        closeSelectCall,
        callDuration,
        timeFormat,
        callTime,
        settingsState,
        errorText,
        showError,
      };
    },
  });
</script>

<style scoped>
  .call-ended {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px 0 24px;
    height: 518px;
    margin: auto;
    width: 100%;
    align-items: center;

    & .title {
      color: black;
      display: block;
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
    }
    & .info-wrap {
      text-align: center;
      max-width: 90%;
      margin: auto;
      & .avatar-wrap {
        align-items: center;
        background-color: var(--sui-gray-100);
        border-radius: 50%;
        display: flex;
        height: 64px;
        justify-content: center;
        margin: auto auto 24px;
        position: relative;
        width: 64px;
      }
      & .text-wrap {
        display: grid;
        gap: 4px;

        & .duration {
          color: var(--sui-gray-700);
          font-size: 14px;
          line-height: 20px;
          white-space: nowrap;
        }

        & .error-container {
          display: flex;
          justify-content: center;
          gap: 5px;
        }
      }
    }
  }
  .call-collapsed {
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: calc(100% - 32px);
    padding: 16px;
    gap: 5px;
    & .hint-phone {
      width: initial !important;
      overflow: hidden;
      &::v-deep(span) {
        white-space: nowrap;
        width: initial;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      & .error-text-wrap {
        display: flex;
        flex-direction: row;
        gap: 5px;
      }
    }
  }

  .call-buttons {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  .phone-number {
    color: var(--sui-gray-900);
    font-weight: 400;
    display: block;
    font-size: 16px;
    line-height: 20px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
