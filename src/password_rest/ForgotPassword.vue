<template>
  <div class="forgot-container">
    <div class="forgot-card">
      <h2>Reset Your Password</h2>
      <p class="subtitle">
        Welcome to <strong>SPMO</strong>! Please enter your email below and we’ll send you a reset link.
      </p>

      <form @submit.prevent="sendResetEmail" class="forgot-form">
        <div class="form-group">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email address"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="btn">
          <span v-if="loading" class="loader"></span>
          {{ loading ? 'Sending...' : 'Send Reset Link' }}
        </button>
      </form>

      <transition name="fade">
        <p v-if="message" class="success">{{ message }}</p>
      </transition>
      <transition name="fade">
        <p v-if="error" class="error">{{ error }}</p>
      </transition>

      <router-link to="/" class="back-link">← Back to Login</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from "../clients/supabase.js"

const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

const sendResetEmail = async () => {
  loading.value = true
  message.value = ''
  error.value = ''

  const { error: err } = await supabase.auth.resetPasswordForEmail(email.value, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  loading.value = false

  if (err) {
    error.value = err.message
  } else {
    message.value = '✅ Password reset email sent! Please check your inbox.'
  }
}
</script>

<style scoped>
/* --- Layout --- */
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: radial-gradient(circle at top left, #4f46e5, #0ea5e9, #0f766e);
  padding: 1rem;
  box-sizing: border-box;
}

/* --- Card --- */
.forgot-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 2.5rem 2rem;
  border-radius: 18px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeIn 0.6s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* --- Form --- */
.forgot-form {
  width: 100%;
}

.form-group {
  width: 100%;
  margin-bottom: 1.25rem;
}

input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.8px solid #cbd5e1;
  border-radius: 10px;
  font-size: 1rem;
  color: #111827;
  outline: none;
  transition: 0.3s;
  background: #f9fafb;
  box-sizing: border-box;
}
input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
  background: #ffffff;
}

/* --- Typography --- */
h2 {
  color: #1e3a8a;
  margin-bottom: 0.75rem;
  font-weight: 700;
  font-size: 1.6rem;
}
.subtitle {
  color: #475569;
  margin-bottom: 1.8rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

/* --- Button --- */
.btn {
  width: 100%;
  padding: 0.9rem;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  letter-spacing: 0.3px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.3s, transform 0.2s;
}
.btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #1e40af, #1d4ed8);
  transform: translateY(-1px);
}
.btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

/* --- Loader Animation --- */
.loader {
  border: 3px solid #fff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
}

/* --- Messages --- */
.success {
  color: #16a34a;
  margin-top: 1rem;
  font-weight: 500;
}
.error {
  color: #dc2626;
  margin-top: 1rem;
  font-weight: 500;
}

/* --- Link --- */
.back-link {
  display: inline-block;
  margin-top: 1.8rem;
  color: #2563eb;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.back-link:hover {
  color: #1e40af;
  text-decoration: underline;
}

/* --- Animations --- */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* --- RESPONSIVENESS --- */
@media (max-height: 600px) {
  .forgot-container {
    align-items: flex-start;
    padding-top: 2rem;
  }
}

@media (max-width: 768px) {
  .forgot-card {
    padding: 2rem 1.5rem;
    border-radius: 14px;
  }
  h2 {
    font-size: 1.4rem;
  }
  .subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
}

@media (max-width: 480px) {
  .forgot-container {
    padding: 1.5rem;
  }
  .forgot-card {
    padding: 1.5rem 1.25rem;
  }
  h2 {
    font-size: 1.25rem;
  }
  .subtitle {
    font-size: 0.85rem;
  }
  input,
  .btn {
    font-size: 0.9rem;
  }
}
</style>
