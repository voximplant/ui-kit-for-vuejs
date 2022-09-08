<template lang="pug">
.page-shell
  WebPhoneShell
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import WebPhoneShell from '@/views/WebPhoneShell.vue';
  import '@/store/calls/init';
  import '@/store/settings/init';
  import '@/store/components/init';

  export default defineComponent({
    name: 'PageShell',
    components: { WebPhoneShell },
  });
</script>
