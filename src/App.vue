<template>
  <div id="app">
    <router-view />
    <InstallButton />
  </div>
</template>

<script>
import InstallButton from './components/InstallButton.vue'

export default {
  components: { InstallButton }
}
</script>