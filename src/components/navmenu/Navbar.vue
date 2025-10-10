<template>
  <div class="page">
    <!-- Header -->
    <header class="header">
      <div class="nav-wrapper">
        <nav>
          <div class="nav-left">
            <!-- Hamburger for mobile -->
            <button class="hamburger" @click="toggleMenu">
              <span :class="{ open: sidebarOpen }"></span>
              <span :class="{ open: sidebarOpen }"></span>
              <span :class="{ open: sidebarOpen }"></span>
            </button>
            <RouterLink to="/" class="logo">EASE SEE SCAN</RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <!-- Overlay for mobile menu -->
    <div class="overlay" v-if="sidebarOpen" @click="closeMenu"></div>

    <div class="layout-body">
      <!-- Sidebar -->
      <aside class="sidebar" :class="{ open: sidebarOpen }">
        <div class="sidebar-header">
          <p class="user-name">{{ user?.user_metadata?.full_name || user?.email }}</p>
          <span class="role-badge" :class="role">{{ role }}</span>
        </div>


        <div class="sidebar-footer">
          <button @click="logout" class="logout-btn">
            <ion-icon name="log-out-outline"></ion-icon>
            Logout
          </button>
        </div>
      </aside>

      <!-- Main content -->
      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../clients/supabase.js' 

const router = useRouter()
const user = ref(null)
const role = ref('user')
const dropdownOpen = ref(false)
const sidebarOpen = ref(false)

const toggleMenu = () => (sidebarOpen.value = !sidebarOpen.value)
const closeMenu = () => (sidebarOpen.value = false)
const toggleDropdown = () => (dropdownOpen.value = !dropdownOpen.value)

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

// Fetch user info and role
onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  if (user.value) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .maybeSingle()
    role.value = profile?.role || 'user'
  }
})
</script>

<style scoped>
/* Header */
.header {
  display: flex;
  align-items: center;
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  padding: 0 1rem;
  position: fixed;
  width: 100%;
  z-index: 1000;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  font-weight: bold;
  margin-left: 1rem;
  text-decoration: none;
  color: #333;
}

/* Hamburger */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  height: 2px;
  width: 100%;
  background: #333;
  transition: 0.3s;
}

.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 900;
}

/* Layout */
.layout-body {
  display: flex;
  margin-top: 60px;
}

/* Sidebar */
.sidebar {
  width: 250px;
  background: #f7f7f7;
  border-right: 1px solid #ddd;
  padding: 1rem;
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px;
  left: 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  margin-bottom: 1rem;
}

.role-badge {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #ccc;
  border-radius: 4px;
  font-size: 0.75rem;
  text-transform: capitalize;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin: 0.5rem 0;
}

.sidebar-nav li a,
.sidebar-nav li button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #333;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
}

.submenu {
  margin-left: 1.5rem;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
}

/* Main content */
.content {
  flex: 1;
  margin-left: 250px;
  padding: 1rem;
  transition: margin-left 0.3s ease;
}

/* Responsive: mobile */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 1000;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .content {
    margin-left: 0;
  }
}
</style>
