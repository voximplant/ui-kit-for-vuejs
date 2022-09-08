<i18n>
{
  "en": {
    "formLabel": {
      "name": "Username",
      "password": "Password",
      "applicationName": "Application",
      "placeholderApplication": "Choose",
      "accountName": "Account name",
      "advancedOptions": "Advanced options ",
      "hint": " (optional)",
      "queueType": "Queue type",
      "tooltip": "Refer to the documentation to learn the difference between SmartQueue and ACDv1.",
      "typeList": {
        "SmartQueue": "SmartQueue",
        "ACD": "ACDv1",
        "None": "None"
      },
      "node": "Node"
    },
    "checkbox": "Remember me",
    "button": "Sign in",
    "errorList": {
      "userName": "Please fill in the field, it is required",
      "password": "Please fill in the field, it is required",
      "applicationName": "Please choose an option, it is required field",
      "accountName": "Please fill in the field, it is required"
    }
  },
  "ru": {
    "formLabel": {
      "name": "Имя пользователя",
      "password": "Пароль",
      "applicationName": "Приложение",
      "placeholderApplication": "Выбрать",
      "accountName": "Имя аккаунта",
      "advancedOptions": "Расширенные настройки ",
      "hint": " (опционально)",
      "queueType": "Тип очереди",
      "tooltip": "О разнице между SmartQueue и ACDv1 читайте в документации",
      "typeList": {
        "SmartQueue": "SmartQueue",
        "ACD": "ACDv1",
        "None": "Нет"
      },
      "node": "Node"
    },
    "checkbox": "Запомнить",
    "button": "Войти",
    "errorList": {
      "name": "Обязательное поле",
      "password": "Обязательное поле",
      "applicationName": "Обязательное поле"
    }
  }
}
</i18n>

<template lang="pug">
.sign-up(@keydown.enter="() => Object.values(errors).some(Boolean) ? '' : loginFx()" tabindex="0")
  .form.scrollbars
    Input(
      id="user-name"
      :modelValue="fields.userName"
      :state="errors.userName ? 'error' : 'default'"
      :label="t('formLabel.name')"
      :caption="errors.userName"
      @update:modelValue="(value) => {fillForm({field: 'userName', value: value})}"
      @blur="(value) => setFieldError('userName', value.length <= 3)"
    )
    Input(
      id="password"
      type="password"
      :modelValue="fields.password"
      :label="t('formLabel.password')"
      :state="errors.password ? 'error' : 'default'"
      :caption="errors.password"
      @update:modelValue="(value) => {fillForm({field: 'password', value: value})}"
      @blur="(value) => setFieldError('password', value.length <= 6)"
    )
    Input(
      id="applications"
      :modelValue="fields.applicationName"
      :label="t('formLabel.applicationName')"
      :state="errors.applicationName ? 'error' : 'default'"
      :caption="errors.applicationName"
      @update:modelValue="(value) => {fillForm({field: 'applicationName', value: value})}"
      @blur="(value) => setFieldError('applicationName', value.length <= 2)"
    )
    Input(
      id="account-name"
      :modelValue="fields.accountName"
      :state="errors.accountName ? 'error' : 'default'"
      :label="t('formLabel.accountName')"
      :caption="errors.accountName"
      @update:modelValue="(value) => {fillForm({field: 'accountName', value: value})}"
      @blur="(value) => setFieldError('accountName', value.length <= 3)"
    )
    Spoiler.optional(
      chevronPosition="right"
    )
      template(v-slot:title="props")
        Typography.text {{ t('formLabel.advancedOptions') }}
          Typography.text(fontColor="var(--sui-gray-500)") {{ t('formLabel.hint') }}
      template(v-slot:default="props")
        .queue-type-wrap
          .title-wrap
            Typography.text {{ t('formLabel.queueType') }}
            Hint.tooltip(:text="t('formLabel.tooltip')")
              Icon(
                height="20"
                width="20"
                name="ic20-help"
                color="--sui-gray-400"
              )
          .radio-button-wrap
            RadioButtonGroup.queue-button(
              :items="[{ label: t('formLabel.typeList.SmartQueue'), value: 2 }, { label: t('formLabel.typeList.ACD'), value: 1 }, { label: t('formLabel.typeList.None'), value: 0 }]"
              name="queueType"
              size="m"
              :key="item"
              :id="item"
              @update:modelValue="(value) => fillForm({ field: 'queueType', value })"
              :modelValue="fields.queueType"
            )
          Input.node-input(
            @update:modelValue="(value) => {fillForm({field: 'node', value: value})}"
            :modelValue="fields.node"
            id="node"
            :label="t('formLabel.node')"
          )
  .button-wrap
    Checkbox.checkbox(
      @update:modelValue="(value) => {fillForm({field: 'remember', value: value})}"
      :modelValue="fields.remember"
      id="remember-user"
      :label="t('checkbox')"
    )
    Button(
      width="fill-container"
      @click="loginFx"
      :disabled="isActiveSignIn"
    ) {{ t('button') }}
</template>

<script lang="ts">
  import { computed, defineComponent, onMounted } from 'vue';
  import '@/store/signIn/init';
  import {
    Button,
    Checkbox,
    Hint,
    Icon,
    Input,
    RadioButtonGroup,
    Spoiler,
    Typography,
  } from '@voximplant/spaceui';
  import { useI18n } from 'vue-i18n';
  import {
    $signInErrors,
    $signInFields,
    fillForm,
    loginFx,
    restoreFillForm,
    setError,
  } from '@/store/signIn/index';
  import { useStore } from 'effector-vue/composition';
  import { QueueType } from '@/types';

  export default defineComponent({
    name: 'SignUp',
    components: { RadioButtonGroup, Button, Checkbox, Input, Spoiler, Typography, Icon, Hint },
    setup() {
      const { t } = useI18n();
      const fields = useStore($signInFields);
      const errors = useStore($signInErrors);

      onMounted(() => {
        restoreFillForm();
      });

      const setFieldError = (field, rule) => {
        if (rule) {
          setError({ field: field, value: t(`errorList.${field}`) });
        } else {
          setError({ field: field, value: '' });
        }
      };

      const isActiveSignIn = computed(() => {
        return Object.values(errors.value).find((error) => error !== '');
      });

      return {
        t,
        fillForm,
        QueueType,
        fields,
        errors,
        setFieldError,
        loginFx,
        isActiveSignIn,
      };
    },
  });
</script>

<style scoped>
  .sign-up {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow-x: hidden;
    width: 100%;

    & .form {
      height: 100%;
      overflow-y: auto;
      padding: 32px;
    }

    & .optional {
      padding: 0;
    }

    & .text {
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
    }

    & .title-wrap {
      align-items: center;
      display: flex;
      margin-bottom: 6px;
    }

    & .tooltip {
      height: 20px;
      margin-left: 6px;
    }

    & .radio-button-wrap {
      margin-bottom: 24px;

      &::v-deep(fieldset.sui-radio-button-fieldset) {
        grid-gap: 32px;
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .node-input {
      margin-bottom: 0;
    }

    & .button-wrap {
      height: fit-content;
      padding: 24px;
    }

    & .checkbox {
      margin-bottom: 16px;
    }
  }
</style>
