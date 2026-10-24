<script setup lang="ts">
import CommunitySphere from '../components/CommunitySphere.vue'
import { useAuth } from '../composables/useAuth'

const { account, sessionLoading } = useAuth()
const emit = defineEmits<{ openAuth: [mode: 'login' | 'register'] }>()
</script>

<template>
  <main class="hero" aria-labelledby="welcome">
    <div class="hero-content">
      <p class="eyebrow"><span aria-hidden="true">&gt;_</span> ПРИВЕТ, ITIS</p>
      <h1 id="welcome">ДОБРО<br />ПОЖАЛОВАТЬ<br /><span>В СООБЩЕСТВО ITIS.</span></h1>
      <p class="hero-description">Задавай вопросы. Делись знаниями.<br />Расти вместе со своими.</p>
      <div class="hero-actions" aria-label="Вход и разделы сообщества">
        <template v-if="!account">
          <button class="button button-primary" type="button" :disabled="sessionLoading" @click="emit('openAuth', 'login')">Войти <span aria-hidden="true">↗</span></button>
          <button class="button button-outline" type="button" :disabled="sessionLoading" @click="emit('openAuth', 'register')">Регистрация</button>
        </template>
        <RouterLink v-else class="button button-primary" to="/profile">В мой профиль <span aria-hidden="true">↗</span></RouterLink>
        <RouterLink class="button button-outline" to="/library">Библиотека</RouterLink>
        <RouterLink class="button button-outline" to="/questions">Вопросы</RouterLink>
      </div>
    </div>
    <div class="sphere-scene"><CommunitySphere /></div>
  </main>
</template>
