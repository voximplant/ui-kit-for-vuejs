<i18n>
{
  "en": {
    "firstCall": {
      "inputTitle": "Call destination",
      "title": "",
      "placeholder": "Enter a phone number, a username or a SIP-address",
      "buttonMain": "Call",
      "buttonVideoCall": "Video Call",
      "buttonAdditional": "Redial"
    },
    "toneDial": {
      "inputTitle": "",
      "title": "Numpad",
      "buttonMain": "End call",
      "buttonAdditional": "Hide numpad"
    },
    "newCall": {
      "inputTitle": "",
      "title": "New Call",
      "buttonMain": "Call",
      "buttonAdditional": "Back to call"
    },
    "error": "Specify whom you want to call",
    "buttonVideoCall": "Video Call"
  },
  "ru": {
    "firstCall": {
      "inputTitle": "Адресат звонка",
      "title": "",
      "buttonMain": "Позвонить",
      "placeholder": "Введите номер телефона, имя пользователя или SIP-адрес",
      "buttonAdditional": "Повторный набор"
    },
    "toneDial": {
      "title": "Панель набора",
      "buttonMain": "Завершить звонок",
      "buttonAdditional": "Скрыть панель"
    },
    "newCall": {
      "inputTitle": "",
      "title": "Новый звонок",
      "buttonMain": "Позвонить",
      "buttonAdditional": "Вернуться к звонку"
    },
    "error": "Укажите, кому вы хотите позвонить",
    "buttonVideoCall": "Видео звонок"
  }
}
</i18n>

<template lang="pug">
.dialing(:class="{'dialing-collapse': settingsState.minimize}")
  .wrap
    .title-wrap(v-if="t(`${dialingStatus}.title`) && !settingsState.minimize")
      Button.get-back(
        iconOnly
        mode="flat"
        :icon="{name: 'ic20-chevron-left', color: '--sui-gray-900'}"
        @click="openCallState(currentActiveCallId)"
      )
      Typography.title {{ t(`${dialingStatus}.title`) }}
    .input-wrap
      Input.input(
        id="dialing-input"
        ref="input"
        clearable
        :state="phoneInput.state"
        :caption="phoneInput.state === 'error' ? t('error') : ''"
        :modelValue="phoneInput.inputValue"
        :label="settingsState.minimize ? '' : t(`${dialingStatus}.inputTitle`)"
        :placeholder="settingsState.minimize ? t(`${dialingStatus}.inputTitle`) : t('firstCall.placeholder')"
        @update:modelValue="(value) => changeInputValue({ value, event: 'change' })"
        @keydown.native.enter="phoneInput.inputValue ? actionOnBtn('primary') : changeInputState('error')"
      )
  Numpad.numpad-dialing(
    v-if="!settingsState.minimize"
    :numpadButtonList="numpadList"
    @click="(value) => changeInputValue({ value, event: 'input' })"
  )
  .buttons-wrap
    Button.button(
      :mode="dialingStatus === 'toneDial' ? 'alert' : 'success'"
      :icon="{ name: dialingStatus === 'toneDial' ? 'ic20-phone-missed' : 'ic20-phone', color: '--sui-white' }"
      :iconOnly="settingsState.minimize"
      @click="() => phoneInput.inputValue ? actionOnBtn('primary') : changeInputState('error')"
    ) {{ settingsState.minimize ? '' : t(`${dialingStatus}.buttonMain`) }}
    Button.button(
      v-if="!settingsState.minimize"
      mode="success"
      :icon="{ spriteUrl: '/static/icons-pack.svg', name: 'ic24-videocamera' }"
      @click="() => phoneInput.inputValue ? actionOnBtn('video') : changeInputState('error')"
    ) {{ t('buttonVideoCall') }}
    Button.button(
      v-if="showAdditionalButton"
      mode="flat"
      @click="openCallState(currentActiveCallId)"
    ) {{ t(`${dialingStatus}.buttonAdditional`) }}
</template>

<script lang="ts">
  import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue';
  import { Button, Input, Label, Numpad, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition';
  import { $settings } from '@/store/settings/index';
  import { numpadList } from '@/lib/numpadButtonList';
  import { $dialingComponentStatus } from '@/store/components/index';
  import {
    $phoneInput,
    actionOnBtn,
    changeInputState,
    changeInputValue,
  } from '@/store/softphone/index';
  import '@/store/softphone/init';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';
  import { onFocusInputPhone } from '@/store/hooks/focus';
  import { $currentActiveCallId, currentActiveCall, openCallState } from '@/store/calls';

  export default defineComponent({
    name: 'Dialing',
    components: { Typography, Button, Input, Numpad, Label },
    setup() {
      const { t } = useI18n();
      const input = ref();
      const phoneInput = useStore($phoneInput);
      const currentActiveCallId = useStore($currentActiveCallId);
      const activeCall = useStore(currentActiveCall);
      const settingsState = useStore($settings);
      const dialingStatus = useStore($dialingComponentStatus);
      const showAdditionalButton = useStore(needToShowAdditionalButton);

      onMounted(() => {
        document.addEventListener('keydown', (event) => {
          onFocusInputPhone(event, input.value?.inputRef);
        });
      });

      onBeforeUnmount(() => {
        document.removeEventListener('keydown', (event) => {
          onFocusInputPhone(event, input.value?.inputRef);
        });
      });

      return {
        t,
        numpadList,
        changeInputValue,
        actionOnBtn,
        phoneInput,
        dialingStatus,
        showAdditionalButton,
        settingsState,
        input,
        changeInputState,
        openCallState,
        currentActiveCallId,
        activeCall,
      };
    },
  });
</script>

<style scoped>
  .dialing {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
    overflow: hidden;
    width: 100%;
    max-width: 557px;
    & .input-wrap {
      padding: 16px 24px 8px;
    }
    & .input {
      margin: 0;
    }
    & .label-wrap {
      align-items: center;
      display: flex;
    }
    & .numpad-dialing {
      margin: 0 auto;
    }
    & .buttons-wrap {
      align-items: center;
      display: flex;
      justify-content: center;
      padding: 0 0 24px;
    }
    & .button {
      &:not(:last-child) {
        margin-right: 8px;
      }
    }
    & .title-wrap {
      align-items: center;
      display: flex;
      padding: 16px 24px 8px;
    }
    & .get-back {
      position: absolute;
    }
    & .title {
      font-size: 16px;
      font-weight: 500;
      line-height: 20px;
      margin: auto;
    }
  }
  .dialing-collapse {
    align-items: center;
    flex-direction: row;
    padding: 16px;
    & .input-wrap {
      padding: 0;
    }
    & .buttons-wrap {
      padding: 0;
    }
    & .wrap {
      margin-right: 16px;
      width: 100%;
    }
  }
</style>
