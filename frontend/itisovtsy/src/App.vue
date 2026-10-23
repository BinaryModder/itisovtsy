<script setup lang="ts">
import { nextTick, onUnmounted, ref } from 'vue'
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

function showProfile(name?: string) {
  if (name) {
    student.value = { name, isNew: true }
    profileKey.value++
  }
  authDialog.value?.close()
  window.location.hash = 'profile'
}

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
      <a class="header-profile" :aria-current="page === 'profile' ? 'page' : undefined" href="#profile">{{ page === 'profile' ? 'Мой профиль' : 'Демопрофиль' }} <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main v-if="page === 'home'" class="hero" aria-labelledby="welcome">
      <div class="hero-content">
        <p class="eyebrow"><span aria-hidden="true">&gt;_</span> ПРИВЕТ, ИТИС</p>
        <h1 id="welcome">ДОБРО<br />ПОЖАЛОВАТЬ,<br /><span>ИТИСОВЕЦ.</span></h1>
        <p class="hero-description">Задавай вопросы. Делись знаниями.<br />Расти вместе со своими.</p>
        <div class="hero-actions" aria-label="Вход в сообщество">
          <button class="button button-primary" type="button" @click="openAuth('login')">Войти <span aria-hidden="true">↗</span></button>
          <button class="button button-outline" type="button" @click="openAuth('register')">Регистрация</button>
        </div>
      </div>
      <div class="sphere-scene"><CommunitySphere /></div>
    </main>

    <KeepAlive><StudentProfile v-if="page === 'profile'" :key="profileKey" :name="student.name" :is-new="student.isNew" /></KeepAlive>

    <KeepAlive><LibraryPage v-if="page === 'library'" /></KeepAlive>

    <KeepAlive><QuestionsPage v-if="page === 'questions'" :name="student.name" /></KeepAlive>

    <footer><span>ИТИС / КФУ</span><span>Свои люди. Общие знания.</span></footer>

    <dialog ref="authDialog" class="auth-dialog" aria-labelledby="auth-title" aria-describedby="auth-description" @close="registrationKey++" @click="($event.target === authDialog) && authDialog?.close()">
      <RegistrationCard v-if="authMode === 'register'" :key="registrationKey" @close="authDialog?.close()" @login="authMode = 'login'" @profile="showProfile" />
      <div v-else class="dialog-content">
        <span class="dialog-marker" aria-hidden="true">&gt;_</span>
        <h2 id="auth-title">{{ authMode === 'login' ? 'Вход скоро откроется' : 'Скоро познакомимся' }}</h2>
        <p id="auth-description">{{ authMode === 'login' ? 'Мы готовим личные профили. Совсем скоро здесь можно будет войти в сообщество.' : 'Регистрация ещё не открыта. Скоро ты сможешь создать свой профиль и присоединиться к сообществу.' }}</p>
        <button type="button" class="button button-primary" autofocus @click="showProfile()">Посмотреть демопрофиль ↗</button>
      </div>
    </dialog>
  </div>
</template>
