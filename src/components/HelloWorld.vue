<template>
  <div class="login-page">
    <form class="login-card" @submit.prevent="login" novalidate>
      <div class="logo-container">
        <img src="/src/image/QRLogo.png" alt="SPMO Logo" class="logo" />
      </div>

      <h2 class="heading">Welcome back!</h2>
      <p class="sub">Sign in with your account now</p>

      <!-- Email -->
      <label class="field">
        <span class="label-text">Email</span>
        <input
          v-model="email"
          type="email"
          autocomplete="username"
          placeholder="Your Email"
          required
        />
      </label>

      <!-- Password -->
      <label class="field password-field">
        <span class="label-text">Password</span>
        <div class="password-input">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            autocomplete="current-password"
            placeholder="Your password"
            required
          />
          <button
            type="button"
            class="pw-toggle"
            @click="togglePassword"
            :aria-pressed="showPassword"
            :title="showPassword ? 'Hide password' : 'Show password'"
          >
            <ion-icon :name="showPassword ? 'eye-outline' : 'eye-off-outline'"></ion-icon>
          </button>
        </div>
      </label>

      <!-- Error message -->
      <div v-if="authError" class="error">{{ authError }}</div>

      <!-- Submit -->
      <button class="submit-btn" type="submit">
        Sign In
      </button>

      <div class="divider">
        <span>For more details contact</span>
      </div>

      <div class="support-section">
        <button class="support-btn" type="button" @click="showSupportModal = true">
          <ion-icon name="help-circle-outline"></ion-icon>
          Supply and Property Management Office
        </button>
      </div>

      <!-- Support Modal -->
      <div
        v-if="showSupportModal"
        class="modal-overlay"
        @click.self="showSupportModal = false"
      >
        <div class="modal-card">
          <h3>Support - SPMO</h3>
          <p>If you need help, contact us at:</p>
          <p>
            <strong>Email:</strong>
            <a href="mailto:pico.csu@carsu.edu.ph">pico.csu@carsu.edu.ph</a>
          </p>
          <p><strong>Phone:</strong> +63 912 345 6789</p>
          <button class="close-btn" @click="showSupportModal = false">Close</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from  '../clients/supabase.js'
import { addIcons } from 'ionicons'
import { eyeOutline, eyeOffOutline, helpCircleOutline } from 'ionicons/icons'

// register icons
addIcons({
  'eye-outline': eyeOutline,
  'eye-off-outline': eyeOffOutline,
  'help-circle-outline': helpCircleOutline,
})

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authError = ref(null)
const showSupportModal = ref(false)

const router = useRouter()

async function login() {
  authError.value = null
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  if (error) {
    authError.value = 'Invalid email or password'
    console.error('Error logging in:', error.message)

    // auto-clear error after 3 seconds
    setTimeout(() => {
      authError.value = null
    }, 3000)
  } else {
    console.log('Logged in successfully:', data)
    router.push('/scanner')
  }
}
</script>

<style scoped>
/* Page wrapper */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #1b1f3a, #035b01);
  color: #fff;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}



/* Logo at the top of the login card */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.logo {
  width: 200px;       /* adjust size */
  height: 200px;
  object-fit: contain;
  border-radius: 12px; /* optional rounded corners */
}


/* Headings */
.heading {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
  font-weight: 700;
  text-align: center;
}
.sub {
  margin: 0 0 1.25rem;
  opacity: 0.9;
  font-size: 0.95rem;
  text-align: center;
}

/* Fields */
.field {
  display: block;
  margin-bottom: 1rem;
}
.label-text {
  display: block;
  font-size: 0.85rem;
  margin-bottom: 0.35rem;
  opacity: 0.95;
}

/* input base */
input[type="text"],
input[type="password"],
input[type="email"] {
  width: 100%;
  padding: 0.85rem 0.9rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255,255,255,0.02);
  color: #fff;
  font-size: 1rem;
  outline: none;
  box-sizing: border-box;
}
input::placeholder {
  color: rgba(255,255,255,0.45);
}

/* password field layout */
.password-field .password-input {
  position: relative;
}
.pw-toggle {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  width: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.03);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.pw-toggle ion-icon {
  font-size: 18px;
}

/* error */
.error {
  background: rgba(255, 60, 60, 0.08);
  color: #ffb3b3;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

/* submit */
.submit-btn {
  width: 100%;
  padding: 0.9rem;
  border-radius: 10px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: linear-gradient(90deg, #ffcc00, #ffdb4d);
  color: #1b1f3a;
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}
.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: rgba(255,255,255,0.6);
  font-size: 0.85rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.2);
  margin: 0 0.5rem;
}

/* Support Button (same as before) */
.support-section {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.support-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.support-btn ion-icon {
  font-size: 1.3rem;
}

.support-btn:hover {
  background: rgba(255,255,255,0.12);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-card {
  background: #1b1f3a;
  color: #fff;
  padding: 2rem;
  border-radius: 14px;
  width: 90%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.5);
}

.modal-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.modal-card p {
  margin: 0.5rem 0;
  font-size: 0.95rem;
}

.modal-card a {
  color: #ffdb4d;
  text-decoration: underline;
}

.close-btn {
  margin-top: 1.25rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  border: none;
  background: #ffdb4d;
  color: #1b1f3a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #ffcc00;
}



/* small screens tweak */
@media (max-width: 420px) {
  .login-card {
    padding: 1.2rem;
    border-radius: 12px;
  }
  .heading { font-size: 1.4rem; }
}
</style>
