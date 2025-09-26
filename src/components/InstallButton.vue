<template>
  <button
    v-if="showButton"
    @click="installApp"
    class="install-btn"
  >
    📲 Install App
  </button>
</template>

<script>
export default {
  data() {
    return {
      deferredPrompt: null,
      showButton: false
    }
  },
  mounted() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      this.deferredPrompt = e
      // Show the install button
      this.showButton = true
    })
  },
  methods: {
    async installApp() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt()
        const { outcome } = await this.deferredPrompt.userChoice
        if (outcome === 'accepted') {
          console.log('User accepted install')
        } else {
          console.log('User dismissed install')
        }
        this.deferredPrompt = null
        this.showButton = false
      }
    }
  }
}
</script>

<style scoped>
.install-btn {
  background: #035b01;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.install-btn:hover {
  background: #048f02;
}
</style>
