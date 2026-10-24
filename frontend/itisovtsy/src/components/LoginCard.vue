<script setup lang="ts">
import { ref } from 'vue'
import { authRequest, type Account } from '../api/auth'
const emit = defineEmits<{ close: []; register: []; authenticated: [account: Account] }>()
const email = ref('')
const password = ref('')
const visible = ref(false)
const pending = ref(false)
const error = ref('')
async function submit() {
  if (pending.value) return
  pending.value = true
  error.value = ''
  try {
    const account = await authRequest<Account>('login', { email: email.value.trim(), password: password.value })
    password.value = ''
    emit('authenticated', account)
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Не удалось войти.'
  } finally { pending.value = false }
}
</script>
<template>
  <div class="registration-card">
    <div class="registration-top"><span class="mock-label">СВОИ / ИТИС</span><button type="button" class="close-button" aria-label="Закрыть вход" :disabled="pending" @click="emit('close')">×</button></div>
    <h2 id="auth-title">С возвращением<span class="registration-dot">.</span></h2>
    <p id="auth-description">Войди, чтобы продолжить со своими.</p>
    <form class="registration-form" :aria-busy="pending" @submit.prevent="submit">
      <div class="form-field"><label for="login-email">Электронная почта</label><input id="login-email" v-model="email" type="email" name="email" autocomplete="username" placeholder="you@example.com" maxlength="254" required autofocus :disabled="pending" /></div>
      <div class="form-field"><label for="login-password">Пароль</label><div class="password-field"><input id="login-password" v-model="password" :type="visible ? 'text' : 'password'" name="password" autocomplete="current-password" placeholder="Твой пароль" maxlength="128" required :disabled="pending" /><button type="button" class="password-toggle" :aria-pressed="visible" :aria-label="visible ? 'Скрыть пароль' : 'Показать пароль'" @click="visible = !visible">{{ visible ? 'Скрыть' : 'Показать' }}</button></div></div>
      <p v-if="error" class="field-error" role="alert">{{ error }}</p>
      <button class="button button-primary registration-submit" type="submit" :disabled="pending">{{ pending ? 'Входим…' : 'Войти ↗' }}</button>
    </form>
    <p class="registration-login">Ещё не с нами? <button type="button" :disabled="pending" @click="emit('register')">Зарегистрироваться</button></p>
  </div>
</template>
