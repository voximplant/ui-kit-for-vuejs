import { createApp } from 'vue';
import App from './App.vue';
import { SpaceUIPlugin } from '@voximplant/spaceui';
import '@voximplant/spaceui/common/сommon.css';
import '@voximplant/spaceui/dist/spaceui.css';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
});

const spaceUiPlugin = SpaceUIPlugin({
  spriteUrl: require(`@voximplant/spaceui/common/sui-icons.svg`),
});

const app = createApp(App);

//click-outside вынести в хук
app.directive('click-outside', {
  beforeMount(el, binding) {
    el.onClickOutside = function (event: MouseEvent) {
      const target = event.target as Element;
      if (
        !(el === target || el.contains(target)) &&
        !target?.classList.contains('sui-button-icon')
      ) {
        binding.value(event, el);
      }
    };
    document.body.addEventListener('click', el.onClickOutside);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.onClickOutside);
  },
});

app.use(i18n).use(spaceUiPlugin).mount('#app');
