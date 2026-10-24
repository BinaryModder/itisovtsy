<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import LoginCard from './components/LoginCard.vue'
import { authRequest, type Account } from './api/auth'
import CommunitySphere from './components/CommunitySphere.vue'
import RegistrationCard from './components/RegistrationCard.vue'
import StudentProfile from './components/StudentProfile.vue'
import LibraryPage from './components/LibraryPage.vue'
import QuestionsPage from './components/QuestionsPage.vue'

const authDialog = ref<HTMLDialogElement | null>(null)
const authMode = ref<'login' | 'register'>('login')
const registrationKey = ref(0)
function currentPage() {
  return window.location.hash === '#questions' ? 'questions' : window.location.hash === '#library' ? 'library' : window.location.hash === '#profile' ? 'profile' : 'home'
}
const page = ref(currentPage())
const student = ref({ name: 'Алексей Смирнов', isNew: false })
const profileKey = ref(0)
const account = ref<Account | null>(null)
const sessionLoading = ref(true)
const sessionError = ref('')
const loggingOut = ref(false)
function authenticated(value: Account) {
  sessionError.value = ''
  account.value = value
  student.value = { name: value.name, isNew: true }
  profileKey.value++
  authDialog.value?.close()
  window.location.hash = 'profile'
}
onMounted(async () => {
  try {
    const value = await authRequest<Account | null>('me')
    if (value) {
      account.value = value
      student.value = { name: value.name, isNew: true }
      profileKey.value++
    }
  } catch (cause) { sessionError.value = (cause as Error).message }
  finally { sessionLoading.value = false }
})
async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  sessionError.value = ''
  try {
    await authRequest('logout', {})
    account.value = null
    student.value = { name: 'Алексей Смирнов', isNew: false }
    profileKey.value++
    window.location.hash = ''
  } catch (cause) { sessionError.value = (cause as Error).message }
  finally { loggingOut.value = false }
}

async function syncPage() {
  page.value = currentPage()
  authDialog.value?.close()
  await nextTick()
  const heading = document.querySelector<HTMLElement>('main:not([hidden]) h1')
  heading?.setAttribute('tabindex', '-1')
  heading?.focus({ preventScroll: true })
  window.scrollTo(0, 0)
}
window.addEventListener('hashchange', syncPage)
onUnmounted(() => window.removeEventListener('hashchange', syncPage))

function openAuth(mode: 'login' | 'register') {
  registrationKey.value++
  authMode.value = mode
  authDialog.value?.showModal()
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <a class="brand" href="#" aria-label="Итисовцы — главная">
        <span class="brand-mark" aria-hidden="true">[INSTITUTE OF TECHNOLOGY AND INTELLIGENCE SYSTEMS]</span>
      </a>
      <nav class="header-nav" aria-label="Основная навигация">
      <a class="header-profile" href="#questions" :aria-current="page === 'questions' ? 'page' : undefined">Вопросы</a>
      <a class="header-profile" href="#library" :aria-current="page === 'library' ? 'page' : undefined">Библиотека</a>
      <a v-if="account" class="header-profile" :aria-current="page === 'profile' ? 'page' : undefined" href="#profile">Мой профиль <span aria-hidden="true">↗</span></a>
      <button v-if="account" class="button button-outline" type="button" :disabled="loggingOut" @click="logout">{{ loggingOut ? 'Выходим…' : 'Выйти' }}</button>
      </nav>
    </header>

    <p v-if="sessionError" class="field-error" role="alert">{{ sessionError }}</p>
    <main v-if="page === 'home'" class="hero" aria-labelledby="welcome">
      <div class="hero-content">
        <p class="eyebrow"><span aria-hidden="true">&gt;_</span> ПРИВЕТ, ИТИС</p>
        <h1 id="welcome">ДОБРО<br />ПОЖАЛОВАТЬ,<br /><span>ИТИСОВЕЦ.</span></h1>
        <p class="hero-description">Задавай вопросы. Делись знаниями.<br />Расти вместе со своими.</p>
        <div v-if="!account" class="hero-actions" aria-label="Вход в сообщество">
          <button class="button button-primary" type="button" :disabled="sessionLoading" @click="openAuth('login')">Войти <span aria-hidden="true">↗</span></button>
          <button class="button button-outline" type="button" :disabled="sessionLoading" @click="openAuth('register')">Регистрация</button>
        </div>
        <a v-if="account" class="button button-primary" href="#profile">В мой профиль ↗</a>
      </div>
      <div class="sphere-scene"><CommunitySphere /></div>
    </main>

    <StudentProfile v-if="page === 'profile'" :key="profileKey" :name="student.name" :is-new="student.isNew" :account="account" />

    <KeepAlive><LibraryPage v-if="page === 'library'" /></KeepAlive>

    <KeepAlive><QuestionsPage v-if="page === 'questions'" :name="student.name" /></KeepAlive>

    <footer><span>ИТИС / КФУ</span><span>Свои люди. Общие знания.</span></footer>

    <dialog ref="authDialog" class="auth-dialog" aria-labelledby="auth-title" aria-describedby="auth-description" @close="registrationKey++" @click="($event.target === authDialog) && authDialog?.close()">
      <RegistrationCard v-if="authMode === 'register'" :key="registrationKey" @close="authDialog?.close()" @login="authMode = 'login'" />
      <LoginCard v-else :key="registrationKey" @close="authDialog?.close()" @register="authMode = 'register'" @authenticated="authenticated" />
    </dialog>
  </div>
</template>
