<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>

      <form @submit.prevent="updatePassword">
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
          required
        />
        <button type="submit" :disabled="loading">
          {{ loading ? "Updating..." : "Update Password" }}
        </button>
      </form>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { supabase } from "../clients/supabase.js";
import { useRouter } from "vue-router";

const router = useRouter();
const newPassword = ref("");
const loading = ref(false);
const message = ref("");
const error = ref("");

const updatePassword = async () => {
  loading.value = true;
  message.value = "";
  error.value = "";

  const { error: err } = await supabase.auth.updateUser({
    password: newPassword.value,
  });

  loading.value = false;

  if (err) {
    error.value = err.message;
  } else {
    message.value = "Password updated successfully! Redirecting to login...";
    setTimeout(() => router.push("/"), 2000);
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
    background: radial-gradient(circle at top left, #4f46e5, #0ea5e9, #0f766e);

  padding: 1rem;
}

.auth-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

h2 {
  margin-bottom: 0.5rem;
  color: #1e293b;
}

p {
  color: #6b7280;
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

button {
  margin-top: 1rem;
  width: 100%;
  padding: 12px;
  background: #2563eb;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;
}

button:hover {
  background: #1d4ed8;
}

button:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}

.success {
  color: #16a34a;
  margin-top: 1rem;
}

.error {
  color: #dc2626;
  margin-top: 1rem;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }

  h2 {
    font-size: 1.5rem;
  }

  input,
  button {
    font-size: 0.95rem;
  }
}
</style>
