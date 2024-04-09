<i18n>
{
  "en": {
    "formLabel": {
      "name": "Username",
      "password": "Password",
      "applicationName": "Application name",
      "placeholderApplication": "Choose",
      "accountName": "Account name",
      "advancedOptions": "Advanced options ",
      "hint": " (optional)",
      "queueType": "Queue type",
      "tooltip": "Refer to the documentation to learn the difference between SmartQueue and ACDv1",
      "typeList": {
        "SmartQueue": "SmartQueue",
        "ACD": "ACDv1",
        "None": "None"
      },
      "node": "Node"
    },
    "checkbox": "Remember me",
    "button": "Sign in",
    "authErrorList": {
      "userName": "Username must be at least 3 symbols long",
      "password": "Password must be at least 6 characters long",
      "applicationName": "Please choose an option, it is required field",
      "accountName": "Please fill in the field, it is required",
      "empty": "Please fill in the field, it is required",
      "404": {
        "userName": "Incorrect user name",
        "accountName": "Incorrect account name",
        "applicationName": "Incorrect application name"
      },
      "401": "Incorrect password"
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
    "authErrorList": {
      "userName": "Имя пользователя должно быть не менее 3 символов",
      "password": "Длина пароля должна быть не менее 6 символов",
      "applicationName": "Обязательное поле",
      "accountName": "Обязательное поле",
      "empty": "Обязательное поле",
      "404": {
        "userName": "Неверное имя пользователя",
        "accountName": "Неверное имя аккаунта",
        "applicationName": "Неверное имя приложения"
      },
      "401": "Неверный пароль"
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
      :caption="errors.userName && t(`authErrorList.${errors.userName}`)"
      @update:modelValue="(value) => {fillForm({field: 'userName', value: value})}"
      @blur="(value) => setFieldError('userName', value.length < 3, !value.length)"
    )
    Input(
      id="password"
      type="password"
      :modelValue="fields.password"
      :label="t('formLabel.password')"
      :state="errors.password ? 'error' : 'default'"
      :caption="errors.password && t(`authErrorList.${errors.password}`)"
      @update:modelValue="(value) => {fillForm({field: 'password', value: value})}"
      @blur="(value) => setFieldError('password', value.length <= 6, !value.length)"
    )
    Select(
      v-if="appConfig.IS_PLATFORM_INTEGRATED"
      id="applications"
      :label="t('formLabel.applicationName')"
      :options="applicationList"
      :state="errors.applicationName ? 'error' : 'default'"
      :modelValue="fields.applicationName"
      @update:modelValue="(value) => {fillForm({field: 'applicationName', value: value})}"
    )
    Input(
      v-else
      id="applications"
      :modelValue="fields.applicationName"
      :label="t('formLabel.applicationName')"
      :state="errors.applicationName ? 'error' : 'default'"
      :caption="errors.applicationName && t(`authErrorList.${errors.applicationName}`)"
      @update:modelValue="(value) => {fillForm({field: 'applicationName', value: value})}"
      @blur="(value) => setFieldError('applicationName', !value.length)"
    )
    Input(
      id="account-name"
      :modelValue="fields.accountName"
      :state="errors.accountName ? 'error' : 'default'"
      :label="t('formLabel.accountName')"
      :caption="errors.accountName && t(`authErrorList.${errors.accountName}`)"
      @update:modelValue="(value) => {fillForm({field: 'accountName', value: value})}"
      @blur="(value) => setFieldError('accountName', !value.length)"
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
      :loading="isLoadingLoginBtn"
      :disabled="isLoadingLoginBtn"
      @click="loginClick()"
    ) {{ t('button') }}
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import '@/store/signIn/init';
  import {
    Button,
    Checkbox,
    Hint,
    Icon,
    Input,
    RadioButtonGroup,
    Select,
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
  import { QueueType, SignInErrors } from '@/types';
  import appConfig from '@/config';

  export default defineComponent({
    name: 'SignUp',
    components: {
      RadioButtonGroup,
      Button,
      Checkbox,
      Input,
      Spoiler,
      Typography,
      Icon,
      Hint,
      Select,
    },
    setup() {
      const { t } = useI18n();
      const fields = useStore($signInFields);
      const errors = useStore($signInErrors);
      const applicationList = ref([]); // TODO add a list of user applications, when integrating into the platform
      const isLoadingLoginBtn = ref(false);
      const toggleLoadingLoginBtn = () => {
        return (isLoadingLoginBtn.value = !isLoadingLoginBtn.value);
      };

      // workaround for media server team
      // TODO: remove after adding serverIp field
      const retrieveServerIpFromQuery = () => {
        const queryParams = new URLSearchParams(window.location.search);
        const serverIp = queryParams.get('serverIp');
        if (serverIp) {
          fillForm({
            field: 'serverIp',
            value: serverIp,
          });
        }
      };

      onMounted(() => {
        restoreFillForm();
        retrieveServerIpFromQuery();
      });

      const loginClick = () => {
        toggleLoadingLoginBtn();
        loginFx().finally(() => toggleLoadingLoginBtn());
      };
      const setFieldError = (field: keyof SignInErrors, rule: boolean, isEmpty: boolean) => {
        if (rule) {
          isEmpty
            ? setError({ field: field, value: 'empty' })
            : setError({ field: field, value: field });
        } else {
          setError({ field: field, value: '' });
        }
      };

      return {
        t,
        fillForm,
        QueueType,
        applicationList,
        fields,
        errors,
        setFieldError,
        loginFx,
        appConfig,
        isLoadingLoginBtn,
        loginClick,
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
