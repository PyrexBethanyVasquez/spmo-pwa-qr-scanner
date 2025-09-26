<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h2>Install SPMO QR Scanner</h2>
      <p>For a faster experience, install the app to your home screen.</p>
      <div class="actions">
        <button @click="installApp" class="btn install">Install</button>
        <button @click="closeModal" class="btn cancel">Maybe Later</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      deferredPrompt: null,
      showModal: false
    }
  },
  mounted() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      this.showModal = true
    })
  },
  methods: {
    async installApp() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt()
        const { outcome } = await this.deferredPrompt.userChoice
        if (outcome === 'accepted') {
          console.log('User installed the app')
        } else {
          console.log('User dismissed install')
        }
        this.deferredPrompt = null
        this.showModal = false
      }
    },
    closeModal() {
      this.showModal = false
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.modal {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.modal h2 {
  margin-bottom: 10px;
  color: black;
}
.modal p {
  margin-bottom: 20px;
  color: #333;
}
.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.btn {
  flex: 1;
  margin: 0 5px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
.install {
  background: #035b01;
  color: white;
}
.install:hover {
  background: #048f02;
}
.cancel {
  background: #ddd;
}
.cancel:hover {
  background: #ccc;
}
</style>
