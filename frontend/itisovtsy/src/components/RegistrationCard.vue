<script setup lang="ts">
import { authRequest } from '../api/auth'
import { computed, nextTick, reactive, ref } from 'vue'

const emit = defineEmits<{ close: []; login: []; }>()
const fields = reactive({ name: '', email: '', password: '', confirmation: '' })
const errors = reactive({ name: '', email: '', password: '', confirmation: '' })
const pending = ref(false)
const serverError = ref('')
const showPassword = ref(false)
const complete = ref(false)
const form = ref<HTMLFormElement | null>(null)
const resultTitle = ref<HTMLHeadingElement | null>(null)
const initials = computed(() => fields.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())

async function submit() {
  if (pending.value) return
  serverError.value = ''
  errors.name = fields.name.trim().length < 2 ? 'Введи имя: минимум 2 символа.' : ''
  errors.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()) ? '' : 'Проверь адрес электронной почты.'
  errors.password = fields.password.length < 8 ? 'Нужно минимум 8 символов.' : ''
  errors.confirmation = !fields.confirmation ? 'Повтори пароль.' : fields.password !== fields.confirmation ? 'Пароли не совпадают.' : ''
  if (Object.values(errors).some(Boolean)) {
    await nextTick()
    form.value?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
    return
  }
  pending.value = true
  try {
    await authRequest('register', { ...fields, name: fields.name.trim(), email: fields.email.trim() })
  } catch (cause) {
    serverError.value = cause instanceof Error ? cause.message : 'Не удалось зарегистрироваться.'
    return
  } finally { pending.value = false }
  fields.name = fields.name.trim()
  fields.email = fields.email.trim()
  fields.password = ''
  fields.confirmation = ''
  complete.value = true
  await nextTick()
  resultTitle.value?.focus()
}
</script>

<template>
  <div class="registration-card">
    <div class="registration-top"><span class="mock-label">СВОИ / ИТИС</span><button type="button" class="close-button" aria-label="Закрыть регистрацию" @click="emit('close')">×</button></div>
    <template v-if="!complete">
      <h2 id="auth-title">Стань своим<span class="registration-dot">.</span></h2>
      <p id="auth-description">Твои знания — начало чего-то большего.</p>
      <form ref="form" class="registration-form" :aria-busy="pending" novalidate @submit.prevent="submit">
        <div class="form-field">
          <label for="register-name">Как тебя зовут?</label>
          <input id="register-name" v-model="fields.name" name="name" autocomplete="name" placeholder="Имя и фамилия" maxlength="80" required autofocus :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'name-error' : undefined" @input="errors.name = ''" />
          <span v-if="errors.name" id="name-error" class="field-error">{{ errors.name }}</span>
        </div>
        <div class="form-field">
          <label for="register-email">Электронная почта</label>
          <input id="register-email" v-model="fields.email" name="email" type="email" autocomplete="email" placeholder="you@example.com" maxlength="254" required :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'email-error' : undefined" @input="errors.email = ''" />
          <span v-if="errors.email" id="email-error" class="field-error">{{ errors.email }}</span>
        </div>
        <div class="form-field">
          <label for="register-password">Пароль</label>
          <div class="password-field">
            <input id="register-password" v-model="fields.password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Не менее 8 символов" minlength="8" maxlength="128" required :aria-invalid="Boolean(errors.password)" :aria-describedby="errors.password ? 'password-error' : undefined" @input="errors.password = ''; errors.confirmation = ''" />
            <button type="button" class="password-toggle" :aria-label="showPassword ? 'Скрыть пароли' : 'Показать пароли'" :aria-pressed="showPassword" @click="showPassword = !showPassword">{{ showPassword ? 'Скрыть' : 'Показать' }}</button>
          </div>
          <span v-if="errors.password" id="password-error" class="field-error">{{ errors.password }}</span>
        </div>
        <div class="form-field">
          <label for="register-confirmation">Повтори пароль</label>
          <input id="register-confirmation" v-model="fields.confirmation" name="confirmation" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Ещё раз, чтобы не ошибиться" maxlength="128" required :aria-invalid="Boolean(errors.confirmation)" :aria-describedby="errors.confirmation ? 'confirmation-error' : undefined" @input="errors.confirmation = ''" />
          <span v-if="errors.confirmation" id="confirmation-error" class="field-error">{{ errors.confirmation }}</span>
        </div>
        <p class="mock-note">После регистрации войди с почтой и паролем.</p>
        <p v-if="serverError" class="field-error" role="alert">{{ serverError }}</p>
        <button class="button button-primary registration-submit" type="submit" :disabled="pending">{{ pending ? 'Создаём аккаунт…' : 'Зарегистрироваться' }} <span aria-hidden="true">↗</span></button>
      </form>
      <p class="registration-login">Уже свой? <button type="button" @click="emit('login')">Войти</button></p>
    </template>
    <template v-else>
      <div class="demo-avatar" aria-hidden="true">{{ initials }}</div>
      <h2 id="auth-title" ref="resultTitle" tabindex="-1">Ты теперь свой<span class="registration-dot">.</span></h2>
      <p id="auth-description">{{ fields.name }}, твой аккаунт создан:</p>
      <div class="demo-profile"><span class="demo-name">{{ fields.name }}</span><span class="demo-email">{{ fields.email }}</span><div class="demo-level"><span>УРОВЕНЬ 1</span><span>0 XP</span></div><div class="demo-progress" aria-hidden="true"></div></div>
      <p class="mock-note">Войди, чтобы открыть свой профиль.</p>
      <button class="button button-primary registration-submit" type="button" @click="emit('login')">Войти <span aria-hidden="true">↗</span></button>
    </template>
  </div>
</template>
