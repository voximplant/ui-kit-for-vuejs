<i18n>
{
  "en": {
    "firstCall": {
      "inputTitle": "Enter destination",
      "title": "",
      "placeholder": "Enter a phone number, username (a user of your application), or SIP address. To process the call correctly, it is necessary that the specified type corresponds to the scenario logic",
      "buttonMain": "Call",
      "buttonVideoCall": "Video Call"
    },
    "toneDial": {
      "inputTitle": "",
      "title": "Numpad",
      "buttonMain": "End call",
      "buttonAdditional": "Back"
    },
    "newCall": {
      "inputTitle": "",
      "title": "New Call",
      "buttonMain": "Call",
      "buttonAdditional": "Back"
    },
    "error": "Specify whom you want to call",
    "buttonVideoCall": "Video Call"
  },
  "ru": {
    "firstCall": {
      "inputTitle": "Адресат звонка",
      "title": "",
      "placeholder": "Введите номер телефона, имя пользователя (пользователя вашего приложения) или SIP-адрес. Для корректной обработки звонка необходимо, чтобы указанный тип соответствовал логике сценария",
      "buttonMain": "Позвонить",
      "buttonVideoCall": "Видео"
    },
    "toneDial": {
      "title": "Панель набора",
      "buttonMain": "Завершить",
      "buttonAdditional": "Скрыть панель"
    },
    "newCall": {
      "inputTitle": "",
      "title": "Новый звонок",
      "buttonMain": "Позвонить",
      "buttonAdditional": "Назад"
    },
    "error": "Укажите, кому вы хотите позвонить",
    "buttonVideoCall": "Видео"
  }
}
</i18n>

<template lang="pug">
.dialing(:class="dialingClasses")
  .wrap
    .title-wrap(v-if="t(`${dialingStatus}.title`) && !settingsState.minimize")
      Button.get-back(
        iconOnly
        size="s"
        mode="flat"
        :icon="{name: 'ic20-chevron-left', width: '20px', height: '20px', color: '--sui-gray-900'}"
        @click="openCallState(currentSelectCallId || currentActiveCallId)"
      )
      Typography.title {{ t(`${dialingStatus}.title`) }}
    .input-wrap
      .input-label(v-if="!settingsState.minimize && dialingStatus === 'firstCall'" )
        Typography.label-title(fontSize="14px" fontWeight="medium") {{ t(`${dialingStatus}.inputTitle`) }}
        Hint(:text="t('firstCall.placeholder')")
          Icon(
            spriteUrl="static/icons-pack.svg"
            name="ic16-question"
            width="16"
            height="16"
          )
      Input.input(
        id="dialing-input"
        ref="phoneNumberInput"
        clearable
        :state="phoneInput.state"
        :caption="phoneInput.state === 'error' ? t('error') : ''"
        :modelValue="phoneInput.inputValue"
        :placeholder="settingsState.minimize ? t(`${dialingStatus}.inputTitle`) : ''"
        @update:modelValue="(value) => changeInputValue({ value, event: 'change' })"
        @keydown.native.enter="phoneInput.inputValue ? actionOnBtn('primary') : changeInputState('error')"
      )
  Numpad.numpad-dialing(
    v-if="!settingsState.minimize"
    :class="{'active-call': callsStore.length}"
    :numpadButtonList="numpadList"
    @click="(value) => changeInputValue({ value, event: 'input' })"
  )
  .buttons-wrap
    Button.button(
      :mode="dialingStatus === 'toneDial' ? 'alert' : 'success'"
      :icon="{ name: dialingStatus === 'toneDial' ? 'ic20-phone-missed' : 'ic20-phone', color: '--sui-white' }"
      :iconOnly="settingsState.minimize"
      @click="onToneDialClick"
    ) {{ settingsState.minimize ? '' : t(`${dialingStatus}.buttonMain`) }}
    Button.button(
      v-if="showVideoButton"
      mode="success"
      :icon="{ spriteUrl: 'static/icons-pack.svg', name: 'ic24-videocamera' }"
      @click="() => phoneInput.inputValue ? actionOnBtn('video') : changeInputState('error')"
    ) {{ t('buttonVideoCall') }}
    Button.button(
      v-if="showAdditionalButton && dialingStatus !== 'firstCall'"
      mode="flat"
      @click="onAdditionalButton"
    ) {{ t(`${dialingStatus}.buttonAdditional`) }}
  ActiveCall.dialing-call-info(v-if="settingsState.maximize && selectCall?.status !== 'ENDED'" )
</template>

<script lang="ts">
  import { computed, defineComponent, onBeforeUnmount, onMounted, Ref, ref } from 'vue';
  import { Button, Hint, Icon, Input, Numpad, Typography } from '@voximplant/spaceui';
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
  import '@/store/settings/onDeviceChange';
  import { needToShowAdditionalButton } from '@/store/NeedToShowAdditionalButton';
  import { onFocusInputPhone } from '@/store/hooks/focus';
  import {
    $currentActiveCallId,
    $currentSelectCallId,
    activeCalls,
    currentSelectCall,
    openCallState,
  } from '@/store/calls';
  import appConfig from '@/config';
  import ActiveCall from '@/components/calls/ActiveCall.vue';

  export default defineComponent({
    name: 'Dialing',
    components: { Typography, Button, Input, Numpad, Hint, Icon, ActiveCall },
    setup() {
      const { t } = useI18n();
      const phoneNumberInput = ref<HTMLFormElement | null>(null);
      const phoneInput = useStore($phoneInput);
      const currentActiveCallId = useStore($currentActiveCallId);
      const currentSelectCallId = useStore($currentSelectCallId);
      const selectCall = useStore(currentSelectCall);
      const callsStore = useStore(activeCalls);
      const settingsState = useStore($settings);
      const dialingStatus = useStore($dialingComponentStatus);
      const showAdditionalButton = useStore(needToShowAdditionalButton);

      // flags
      const showVideoButton = computed(
        () =>
          dialingStatus.value !== 'toneDial' &&
          !settingsState.value.minimize &&
          !appConfig.AUDIO_ONLY
      );

      // buttons action
      const onAdditionalButton = () => {
        if (dialingStatus.value === 'firstCall') actionOnBtn('primary');
        else openCallState(currentActiveCallId.value);
      };
      const onToneDialClick = () => {
        if (dialingStatus.value === 'toneDial') {
          actionOnBtn('primary');
        } else {
          phoneInput.value.inputValue ? actionOnBtn('primary') : changeInputState('error');
        }
      };

      // classes and styles
      const dialingClasses = computed(() => ({
        'dialing-collapse': settingsState.value.minimize,
      }));
      const dialingContentGap: Ref<string> = computed(() => {
        if (settingsState.value.minimize) return '16px';
        return appConfig.IS_CUSTOMIZE && !callsStore.value.length ? '56px' : '0';
      });
      const dialingHeight = computed(() => (settingsState.value.maximize ? 'fit-content' : '100%'));

      onMounted(() => {
        document.addEventListener('keydown', (event) => {
          onFocusInputPhone(event, phoneNumberInput.value?.inputRef);
        });
      });

      onBeforeUnmount(() => {
        document.removeEventListener('keydown', (event) => {
          onFocusInputPhone(event, phoneNumberInput.value?.inputRef);
        });
      });

      return {
        t,
        numpadList,
        dialingClasses,
        changeInputValue,
        actionOnBtn,
        phoneInput,
        onAdditionalButton,
        dialingStatus,
        showAdditionalButton,
        showVideoButton,
        settingsState,
        phoneNumberInput,
        changeInputState,
        openCallState,
        currentActiveCallId,
        currentSelectCallId,
        callsStore,
        dialingContentGap,
        onToneDialClick,
        dialingHeight,
        selectCall,
      };
    },
  });
</script>

<style scoped>
  .dialing {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: v-bind('dialingHeight');
    justify-content: space-between;
    width: inherit;
    margin: auto;
    max-width: 384px; /* max softphone width */
    gap: v-bind('dialingContentGap');
    padding: 16px 24px 24px;
    .wrap {
      width: 336px;
      display: grid;
      gap: 8px;
    }
    & .input-wrap {
      .input-label {
        display: flex;
        flex-direction: row;
        gap: 4px;
        .label-title {
          line-height: 16px;
        }
      }
      .hint-container {
        width: inherit;
      }
    }
    & .input {
      margin: 0;
    }
    & .label-wrap {
      align-items: center;
      display: flex;
    }
    & .numpad-dialing {
      margin: 15px auto 30px;
    }
    & .active-call {
      margin: 15px auto 30px;
    }
    & .buttons-wrap {
      align-items: center;
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    & .dialing-call-info {
      position: absolute;
      left: 16px;
      bottom: 16px;
      margin: 0 !important;
      padding: 5px 0;
    }
    & .title-wrap {
      align-items: center;
      display: flex;
      height: 32px;
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
    max-width: inherit !important;
    & .input-wrap {
      padding: 0;
    }
    & .buttons-wrap {
      padding: 0;
    }
    & .wrap {
      width: inherit;
    }
  }
</style>
