<template>
  <div class="change-password-page">
    <div class="change-password-card">
      <div class="header">
        <div class="icon-wrapper">
          <ion-icon name="lock-closed-outline"></ion-icon>
        </div>
        <h2>Change Your Password</h2>
        <p class="subtitle">This is your first login. Please create a new password for security.</p>
      </div>

      <form @submit.prevent="changePassword">
        <div class="form-group">
          <label for="current-password">Current Password</label>
          <div class="input-wrapper">
            <ion-icon name="key-outline" class="input-icon"></ion-icon>
            <input
              id="current-password"
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="currentPassword"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              class="pw-toggle"
              @click="showCurrentPassword = !showCurrentPassword"
              :aria-label="showCurrentPassword ? 'Hide password' : 'Show password'"
            >
              <ion-icon
                :name="showCurrentPassword ? 'eye-outline' : 'eye-off-outline'"
              ></ion-icon>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="new-password">New Password</label>
          <div class="input-wrapper">
            <ion-icon name="lock-closed-outline" class="input-icon"></ion-icon>
            <input
              id="new-password"
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              placeholder="Enter new password"
              required
            />
            <ion-icon
              v-if="isPasswordValid"
              name="checkmark-circle"
              class="success-icon"
            ></ion-icon>
            <button
              type="button"
              class="pw-toggle"
              @click="showNewPassword = !showNewPassword"
              :aria-label="showNewPassword ? 'Hide password' : 'Show password'"
            >
              <ion-icon
                :name="showNewPassword ? 'eye-outline' : 'eye-off-outline'"
              ></ion-icon>
            </button>
          </div>
          <small class="hint">8-20 characters with uppercase, number, and special character</small>
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirm New Password</label>
          <div class="input-wrapper">
            <ion-icon name="shield-checkmark-outline" class="input-icon"></ion-icon>
            <input
              id="confirm-password"
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              placeholder="Confirm new password"
              required
            />
            <ion-icon
              v-if="passwordsMatch && confirmPassword"
              name="checkmark-circle"
              class="success-icon"
            ></ion-icon>
            <button
              type="button"
              class="pw-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              <ion-icon
                :name="showConfirmPassword ? 'eye-outline' : 'eye-off-outline'"
              ></ion-icon>
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="error-box">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <button type="submit" class="submit-btn" :disabled="isChanging">
          <span v-if="!isChanging">Change Password</span>
          <span v-else class="loading">
            <span class="spinner"></span>
            Changing...
          </span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../clients/supabase.js'
import { useToast } from 'vue-toastification'

const toast = useToast()
const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const isChanging = ref(false)

const isPasswordValid = computed(() => {
  const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,20}$/
  return regex.test(newPassword.value)
})

const passwordsMatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value
})

async function changePassword() {
  if (isChanging.value) return

  errorMessage.value = ''

  // Validate password
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters.'
    return
  }
  if (newPassword.value.length > 20) {
    errorMessage.value = 'Password cannot exceed 20 characters.'
    return
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).*$/
  if (!passwordRegex.test(newPassword.value)) {
    errorMessage.value =
      'Password must include at least one uppercase letter, one number, and one special character.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isChanging.value = true

  try {
    // Update password in Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (updateError) {
      errorMessage.value = updateError.message
      return
    }

    // Mark first_login as false
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('📝 Current user ID:', user?.id)

    if (user) {
      const { data: updateData, error: dbError } = await supabase
        .from('users')
        .update({ first_login: false })
        .eq('id', user.id)
        .select()
        

      if (dbError) {
        console.error('Error updating first_login:', dbError.message)
      }
       else {
        console.log('✅ first_login updated successfully:', updateData)
      }
    }

    toast.success('Password changed successfully!')
    setTimeout(() => {
      router.push('/scanner')
    }, 1500)
  } catch (err) {
    console.error('Error changing password:', err)
    errorMessage.value = 'An unexpected error occurred.'
  } finally {
    isChanging.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.change-password-card {
  background: white;
  padding: 0;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.06);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.header {
  background-color: #f8f9fb;
  padding: 40px 40px 30px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.icon-wrapper {
  width: 64px;
  height: 64px;
  background-color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.icon-wrapper ion-icon {
  font-size: 32px;
  color: white;
}

h2 {
  margin: 0 0 10px;
  color: #111827;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
}

form {
  padding: 40px;
}

.form-group {
  margin-bottom: 24px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  font-size: 18px;
  pointer-events: none;
}

input {
  width: 100%;
  padding: 12px 45px 12px 45px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  background-color: #fafafa;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.pw-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #9ca3af;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.pw-toggle:hover {
  color: #6b7280;
}

.pw-toggle ion-icon {
  font-size: 20px;
}

.success-icon {
  position: absolute;
  right: 50px;
  color: #10b981;
  font-size: 20px;
  pointer-events: none;
}

.hint {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 12px;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 24px;
}

.error-box ion-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>