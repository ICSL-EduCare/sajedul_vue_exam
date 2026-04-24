<template>
  <q-page class="flex flex-center" style="min-height: 100vh; background: #0f172a">
    <div style="width: 100%; max-width: 420px; padding: 1rem">
      <!-- Brand -->
      <div class="row justify-center items-center q-gutter-md q-mb-lg">
        <div class="brand-logo">
          <q-icon name="restaurant" size="22px" color="white" />
        </div>
        <div>
          <div class="brand-name">SA Cafe</div>
          <div class="brand-sub">Restaurant Management System</div>
        </div>
      </div>

      <!-- Card -->
      <q-card flat class="login-card">
        <transition name="slide" mode="out-in">
          <!-- LOGIN -->
          <div v-if="!showRegister" key="login">
            <q-card-section class="card-top">
              <div class="card-title">Welcome back</div>
              <div class="card-sub">Sign in to your account</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="handleLogin" greedy>
                <div class="field-label">Email</div>
                <q-input
                  v-model="loginForm.email"
                  outlined
                  dense
                  :type="email"
                  class="q-mb-md"
                  :rules="[(v) => !!v || 'Required', (v) => /.+@.+\..+/.test(v) || 'Invalid email']"
                >
                  <template #prepend><q-icon name="mail_outline" color="grey-6" /></template>
                </q-input>

                <div class="field-label">Password</div>
                <q-input
                  v-model="loginForm.password"
                  outlined
                  dense
                  :type="showPwd ? 'text' : 'password'"
                  class="q-mb-md"
                  :rules="[(v) => !!v || 'Required']"
                >
                  <template #prepend><q-icon name="lock_outline" color="grey-6" /></template>
                  <template #append>
                    <q-icon
                      :name="showPwd ? 'visibility_off' : 'visibility'"
                      color="grey-6"
                      class="cursor-pointer"
                      @click="showPwd = !showPwd"
                    />
                  </template>
                </q-input>

                <q-banner v-if="loginError" dense rounded class="error-banner q-mb-md">
                  <template #avatar><q-icon name="error_outline" /></template>
                  {{ loginError }}
                </q-banner>

                <q-btn
                  type="submit"
                  label="Sign In"
                  unelevated
                  :loading="loading"
                  class="pos-btn full-width q-mb-sm"
                />
              </q-form>

              <q-btn
                flat
                label="Create an account"
                class="ghost-btn full-width"
                @click="openRegister"
              />
            </q-card-section>
          </div>

          <!-- REGISTER -->
          <div v-else key="register">
            <q-card-section class="card-top">
              <div class="card-title">Create account</div>
            </q-card-section>

            <q-card-section>
              <q-form @submit.prevent="handleRegister" greedy>
                <div class="field-label">Full Name</div>
                <q-input
                  v-model="regForm.name"
                  outlined
                  dense
                  class="q-mb-md"
                  :rules="[(v) => !!v || 'Required']"
                >
                  <template #prepend><q-icon name="person_outline" color="grey-6" /></template>
                </q-input>

                <div class="field-label">Email</div>
                <q-input
                  v-model="regForm.email"
                  outlined
                  dense
                  type="email"
                  class="q-mb-md"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => /.+@.+\..+/.test(v) || 'Invalid email',
                    (v) => !emailExists(v) || 'Already registered',
                  ]"
                >
                  <template #prepend><q-icon name="mail_outline" color="grey-6" /></template>
                </q-input>

                <div class="field-label">Phone</div>
                <q-input
                  v-model="regForm.phone"
                  outlined
                  dense
                  class="q-mb-md"
                  :rules="[(v) => !!v || 'Required']"
                >
                  <template #prepend><q-icon name="phone" color="grey-6" /></template>
                </q-input>

                <div class="field-label">Password</div>
                <q-input
                  v-model="regForm.password"
                  outlined
                  dense
                  :type="showRegPwd ? 'text' : 'password'"
                  class="q-mb-md"
                  :rules="[(v) => !!v || 'Required', (v) => v.length >= 6 || 'Min 6 digit']"
                >
                  <template #prepend><q-icon name="lock_outline" color="grey-6" /></template>
                  <template #append>
                    <q-icon
                      :name="showRegPwd ? 'visibility_off' : 'visibility'"
                      color="grey-6"
                      class="cursor-pointer"
                      @click="showRegPwd = !showRegPwd"
                    />
                  </template>
                </q-input>

                <div class="field-label">Confirm Password</div>
                <q-input
                  v-model="regForm.confirmPassword"
                  outlined
                  dense
                  :type="showRegPwd ? 'text' : 'password'"
                  class="q-mb-md"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) => v === regForm.password || 'Passwords do not match',
                  ]"
                >
                  <template #prepend><q-icon name="lock_outline" color="grey-6" /></template>
                </q-input>

                <q-btn
                  type="submit"
                  label="Create Account"
                  unelevated
                  :loading="loading"
                  class="pos-btn full-width q-mb-sm"
                />
              </q-form>

              <q-btn
                flat
                icon="arrow_back"
                label="Back to Sign In"
                class="ghost-btn full-width"
                @click="showRegister = false"
              />
            </q-card-section>
          </div>
        </transition>

        <!-- Footer -->
        <q-card-section
          class="row justify-center items-center q-gutter-xs q-pt-none q-pb-md"
          style="color: #94a3b8; font-size: 12px"
        >
          <q-icon name="shield" size="13px" />
          <span>Data stored locally & securely</span>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'

const router = useRouter()

const showRegister = ref(false)
const loading = ref(false)
const loginError = ref('')
const showRegPwd = ref(false)

const loginForm = ref({ email: '', password: '' })
const regForm = ref({ name: '', email: '', phone: '', password: '', confirmPassword: '' })

function getUsers() {
  return JSON.parse(localStorage.getItem('pos_users') || '[]')
}

function emailExists(email) {
  return getUsers().some((u) => u.email === email)
}

function openRegister() {
  loginError.value = ''
  showRegister.value = true
}

async function handleLogin() {
  loginError.value = ''
  loading.value = true
  await new Promise((r) => setTimeout(r, 500))

  const user = getUsers().find(
    (u) => u.email === loginForm.value.email && u.password === loginForm.value.password,
  )

  if (user) {
    localStorage.setItem('pos_current_user', JSON.stringify(user))
    Notify.create({ type: 'positive', message: `Welcome back, ${user.name}!`, position: 'top' })
    router.push('/restaurant')
  } else {
    loginError.value = 'Invalid email or password. Please try again.'
  }
  loading.value = false
}

async function handleRegister() {
  loading.value = true
  await new Promise((r) => setTimeout(r, 500))

  const users = getUsers()
  users.push({
    id: Date.now(),
    name: regForm.value.name,
    email: regForm.value.email,
    phone: regForm.value.phone,
    password: regForm.value.password,
    createdAt: new Date().toISOString(),
  })
  localStorage.setItem('pos_users', JSON.stringify(users))

  Notify.create({ type: 'positive', message: 'Account created! Please sign in.', position: 'top' })
  regForm.value = { name: '', email: '', phone: '', password: '', confirmPassword: '' }
  showRegister.value = false
  loading.value = false
}
</script>

<style scoped>
.brand-logo {
  width: 44px;
  height: 44px;
  background: #e05a2b;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  font-family: 'Georgia', serif;
}
.brand-sub {
  font-size: 12px;
  color: #94a3b8;
}

.login-card {
  border-radius: 18px !important;
  background: #fff !important;
}
body.body--dark .login-card {
  background: #1e293b !important;
}

.card-top {
  padding: 24px 24px 12px;
  border-bottom: 1px solid #f1f5f9;
}
body.body--dark .card-top {
  border-bottom-color: #334155;
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}
body.body--dark .card-title {
  color: #f8fafc;
}
.card-sub {
  font-size: 13px;
  color: #64748b;
  margin-top: 2px;
}

.field-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 4px;
}

.pos-btn {
  background: #e05a2b !important;
  color: #fff !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  height: 42px !important;
}
.pos-btn:hover {
  background: #c94d22 !important;
}

.ghost-btn {
  color: #e05a2b !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
}

.error-banner {
  background: #fff1f0 !important;
  color: #c0392b !important;
  border: 1px solid #fecdca !important;
  border-radius: 10px !important;
  font-size: 13px !important;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
