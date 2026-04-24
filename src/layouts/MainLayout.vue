<template>
  <q-layout view="hHh lpR fFf">
    <q-header v-if="isLoggedIn" class="top-header">
      <q-toolbar class="top-bar">
        <!-- Left: Brand -->
        <div class="brand">
          <span class="brand-text">{{ restaurantName }}</span>
        </div>

        <!-- Center: Nav links -->
        <div class="nav-center">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="nav-link"
            :class="{ 'nav-link--active': route.path === link.to }"
          >
            <span>{{ link.label }}</span>
          </router-link>
        </div>

        <!-- Right: Actions -->
        <div class="top-actions">
          <!-- Theme toggle -->
          <q-toggle
            v-model="darkMode"
            checked-icon="nightlight_round"
            unchecked-icon="wb_sunny"
            color="orange"
            @update:model-value="(val) => $q.dark.set(val)"
          />

          <div class="top-user">
            <div class="top-avatar">{{ userInitials }}</div>
            <span class="top-user-name">{{ currentUser?.name }}</span>
          </div>

          <!-- Logout power button -->
          <q-btn flat round dense color="grey-4" @click="handleLogout">
            <q-icon name="power_settings_new" size="18px" />
            <q-tooltip>Logout</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const currentUser = ref(null)
const restaurantName = ref('SA Cafe')
const darkMode = ref(false)

const navLinks = [
  { to: '/restaurant', icon: 'store', label: 'My Restaurant' },
  { to: '/items', icon: 'restaurant_menu', label: 'All Items' },
  { to: '/orders', icon: 'receipt_long', label: 'Orders' },
  { to: '/invoices', icon: 'description', label: 'Invoices' },
]

const isLoggedIn = computed(() => route.path !== '/')

const userInitials = computed(() => {
  const name = currentUser.value?.name || ''
  return (
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  )
})

watch(
  () => route.path,
  () => {
    currentUser.value = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
    loadRestaurantName()
    darkMode.value = $q.dark.isActive
  },
)

function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) return
  localStorage.removeItem('pos_current_user')
  currentUser.value = null
  router.push('/')
}

function loadRestaurantName() {
  const rest = JSON.parse(localStorage.getItem('pos_restaurant') || 'null')
  restaurantName.value = rest?.name || 'SA Cafe'
}

onMounted(() => {
  currentUser.value = JSON.parse(localStorage.getItem('pos_current_user') || 'null')
  loadRestaurantName()
  darkMode.value = $q.dark.isActive
})
</script>

<style scoped>
.top-header {
  background: #0f172a !important;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3) !important;
}

.top-bar {
  height: 56px;
  min-height: 56px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* Left - Brand */
.brand {
  justify-self: start;
}

.brand-text {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  font-family: 'Georgia', serif;
  letter-spacing: -0.3px;
}

/* Center - Nav */
.nav-center {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-self: center;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 7px 18px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.15s;
  white-space: nowrap;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-link--active {
  background: #e05a2b !important;
  color: #fff !important;
  font-weight: 600;
}

/* Right - Actions */
.top-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: end;
}

.top-user {
  display: flex;
  align-items: center;
  gap: 7px;
}

.top-avatar {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #e05a2b;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.top-user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}

/* Mobile */
@media (max-width: 700px) {
  .top-bar {
    grid-template-columns: auto 1fr auto;
  }
  .nav-center {
    overflow-x: auto;
    gap: 0;
  }
  .nav-link {
    padding: 6px 10px;
    font-size: 13px;
  }
  .top-user-name {
    display: none;
  }
}
</style>
