<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoginCard from './components/LoginCard.vue'
import { authRequest, type Account } from './api/auth'
import { useAuth } from './composables/useAuth'
import RegistrationCard from './components/RegistrationCard.vue'

const router = useRouter()
const route = useRoute()
const { account, studentName, sessionError, restoreSession } = useAuth()
const authDialog = ref<HTMLDialogElement | null>(null)
const authMode = ref<'login' | 'register'>('login')
const registrationKey = ref(0)
const loggingOut = ref(false)
const pageProps = computed(() => {
  if (route.name === 'profile') return { name: studentName.value, isNew: Boolean(account.value), account: account.value }
  if (route.name === 'questions') return { name: studentName.value }
  return {}
})

function authenticated(value: Account) {
  sessionError.value = ''
  account.value = value
  authDialog.value?.close()
  void router.push({ name: 'profile' })
}
onMounted(restoreSession)

async function logout() {
  if (loggingOut.value) return
  loggingOut.value = true
  sessionError.value = ''
  try {
    await authRequest('logout', {})
    account.value = null
    await router.replace({ name: 'home' })
  } catch (cause) { sessionError.value = (cause as Error).message }
  finally { loggingOut.value = false }
}

watch(() => route.fullPath, async () => {
  authDialog.value?.close()
  await nextTick()
  const heading = document.querySelector<HTMLElement>('main:not([hidden]) h1')
  heading?.setAttribute('tabindex', '-1')
  heading?.focus({ preventScroll: true })
})

function openAuth(mode: 'login' | 'register') {
  registrationKey.value++
  authMode.value = mode
  authDialog.value?.showModal()
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/" aria-label="Сообщество ITIS — главная">
        <span class="brand-mark" aria-hidden="true">[INSTITUTE OF TECHNOLOGY AND INTELLIGENCE SYSTEMS]</span>
      </RouterLink>
      <nav class="header-nav" aria-label="Основная навигация">
      <RouterLink class="header-profile" to="/practice">Практикум</RouterLink>
      <RouterLink class="header-profile" to="/questions">Вопросы</RouterLink>
      <RouterLink class="header-profile" to="/library">Библиотека</RouterLink>
      <RouterLink v-if="account" class="header-profile" to="/profile">Мой профиль <span aria-hidden="true">↗</span></RouterLink>
      <button v-if="account" class="button button-outline" type="button" :disabled="loggingOut" @click="logout">{{ loggingOut ? 'Выходим…' : 'Выйти' }}</button>
      </nav>
    </header>

    <p v-if="sessionError" class="field-error" role="alert">{{ sessionError }}</p>
    <RouterView v-slot="{ Component }">
      <KeepAlive include="LibraryPage,QuestionsPage,PracticeView">
        <component :is="Component" v-bind="pageProps" @open-auth="openAuth" />
      </KeepAlive>
    </RouterView>

    <footer><span>ITIS / Kazan Federal University</span><span>Свои люди. Общие знания.</span></footer>

    <dialog ref="authDialog" class="auth-dialog" aria-labelledby="auth-title" aria-describedby="auth-description" @close="registrationKey++" @click="($event.target === authDialog) && authDialog?.close()">
      <RegistrationCard v-if="authMode === 'register'" :key="registrationKey" @close="authDialog?.close()" @login="authMode = 'login'" />
      <LoginCard v-else :key="registrationKey" @close="authDialog?.close()" @register="authMode = 'register'" @authenticated="authenticated" />
    </dialog>
  </div>
</template>
