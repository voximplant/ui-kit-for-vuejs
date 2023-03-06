<i18n>
{
  "en": {
    "reconnecting": {
      "title": "Internet connection error",
      "text": "Trying to connect",
      "button": "End call"
    },
    "callPause": {
      "title": "Another speaker has paused the call",
      "text": "Wait for him to return or end the call",
      "titleMinimize": "The call was paused",
      "textMinimize": "Wait for your speaker",
      "button": "Ok"
    },
    "loginFailed": {
      "title": "Failed to login",
      "text": "Something went wrong. Please try again",
      "button": "Close"
    },
    "sessionExpired": {
      "title": "Your session has expired",
      "text": "Please login again",
      "button": "Sign In"
    },
    "pauseCallEnded": {
      "title": "A paused call was ended",
      "text": "The call with",
      "text_2": "was ended",
      "button": "Ok"
    }
  },
  "ru": {
    "reconnecting": {
      "title": "Ошибка подключения к интернету",
      "text": "Попытка подключения",
      "button": "Завершить вызов"
    },
    "callPause": {
      "title": "Другой спикер приостановил вызов",
      "text": "Подождите, пока он вернется, или завершите разговор",
      "titleMinimize": "Вызов был приостановлен",
      "textMinimize": "Подожди своего спикера",
      "button": "Ок"
    },
    "loginFailed": {
      "title": "Не удалось войти",
      "text": "Что-то пошло не так. Пожалуйста, попробуйте еще раз",
      "button": "Закрыть"
    },
    "sessionExpired": {
      "title": "Ваша сессия истекла",
      "text": "Пожалуйста, войдите снова",
      "button": "Войти"
    },
    "pauseCallEnded": {
      "title": "Приостановленный вызов завершен",
      "text": "Вызов с",
      "text_2": "был завершен",
      "button": "Ок"
    }
  }
}
</i18n>

<template lang="pug">
Notification.notification-block(v-if="showNotification" v-focus-trap="showNotification" :class="notificationClasses" mode="error")
  .notification-text-block
    Icon( :name="notificationContent.iconName" :width="notificationContent.iconSize" :height="notificationContent.iconSize" :color="notificationContent.iconColor")
    div(:class="{'text-gap': !settings.minimize}")
      Typography(style="font-weight: 500" fontSize="16px") {{ notificationContent.title }}
      .notification-text
        Spinner(v-if="notificationContent.showSpinner" size="m")
        Typography(fontSize="16px" v-if="notificationState === 'pauseCallEnded'") {{ t('pauseCallEnded.text') +  ` ${NotificationContent.pauseCallEnded.number} ` + t('pauseCallEnded.text_2') }}
        Typography(fontSize="16px" v-else) {{ notificationContent.text }}
  Button.leave-btn(
    v-if="notificationContent.showButton"
    size="m"
    :mode="notificationContent.buttonMode"
    :icon="notificationContent.buttonIcon"
    :iconOnly="!buttonText"
    @click="notificationContent.buttonAction()"
  ) {{ buttonText }}
</template>

<script lang="ts">
  import { computed, defineComponent } from 'vue';
  import { Button, Icon, Notification, Spinner, Typography } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import { useStore } from 'effector-vue/composition';
  import { $settings } from '@/store/settings';
  import { vFocusTrap } from '@/helper/trapFocusElements';
  import { $notificationState, $showNotification, NotificationContent } from '@/store/notification';
  import { $calls, $currentActiveCallId, $currentSelectCallId } from '@/store/calls';

  export default defineComponent({
    name: 'NotificationBlock',

    components: {
      Typography,
      Notification,
      Button,
      Spinner,
      Icon,
    },
    directives: {
      'focus-trap': vFocusTrap,
    },
    setup() {
      const { t } = useI18n();
      const showNotification = useStore($showNotification);
      const notificationState = useStore($notificationState);
      const settings = useStore($settings);
      const calls = useStore($calls);
      const currentActiveCallId = useStore($currentActiveCallId);
      const currentSelectCallId = useStore($currentSelectCallId);

      const notificationClasses = computed(() => ({
        minimize: showNotification && settings.value.minimize,
      }));
      const iconSize = computed(() => (settings.value.minimize ? 24 : 40));
      const minimizeAppendix = computed(() =>
        NotificationContent[notificationState.value].showMinimazeText && settings.value.minimize
          ? 'Minimize'
          : ''
      );

      const notificationContent = computed(() => ({
        iconName: NotificationContent[notificationState.value].icon,
        iconSize,
        iconColor: NotificationContent[notificationState.value].iconColor,
        title: t(`${notificationState.value}.title${minimizeAppendix.value}`),
        text: t(`${notificationState.value}.text${minimizeAppendix.value}`),
        buttonIcon: NotificationContent[notificationState.value].buttonIcon,
        showSpinner: NotificationContent[notificationState.value].showSpinner,
        buttonMode: NotificationContent[notificationState.value].buttonMode,
        showButton:
          notificationState.value === 'reconnecting'
            ? currentActiveCallId.value ||
              calls.value[currentSelectCallId.value]?.call?.state() === 'PROGRESSING'
            : NotificationContent[notificationState.value].showButton,
        buttonAction: NotificationContent[notificationState.value].buttonAction,
      }));
      const buttonText = computed(() => {
        return NotificationContent[notificationState.value].buttonIcon && settings.value.minimize
          ? ''
          : t(`${notificationState.value}.button`);
      });

      return {
        t,
        showNotification,
        notificationState,
        settings,
        iconSize,
        notificationClasses,
        notificationContent,
        NotificationContent,
        currentActiveCallId,
        buttonText,
      };
    },
  });
</script>

<style scoped>
  .notification.notification-block {
    max-width: 310px;
    position: absolute;
    text-align: center;
    z-index: 25; /* z-index 25 & over: for notifications (NotificationStatuses) */
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translatey(-50%);

    .notification-text-block {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 8px;
      flex-wrap: nowrap;
      align-items: center;

      .notification-text {
        display: grid;
        justify-content: center;
        grid-auto-flow: column;
        align-items: center;
        gap: 10px;
      }
    }

    .text-gap {
      display: grid;
      gap: 8px;
      word-break: break-word;
    }

    &::v-deep(.sui-icon.icon) {
      display: none;
    }

    .leave-btn {
      margin: 24px auto 0;
    }

    &::v-deep(.close) {
      display: none;
    }
  }
  .notification.notification-block.minimize {
    width: inherit;
    padding: 24px 12px;
    gap: 4px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    .notification-text-block {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      width: inherit;
      flex-wrap: nowrap;
      gap: 8px;
      .notification-text {
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: nowrap;
      }
    }
    .leave-btn {
      margin: auto;
    }
  }
</style>
