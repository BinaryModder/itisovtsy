<script setup lang="ts">
import type { Account } from '../api/auth'
import { computed, reactive, ref } from 'vue'

const props = defineProps<{ name: string; isNew: boolean; account?: Account | null }>()
const profile = reactive({ name: props.name, group: props.isNew ? '' : '11-402', bio: props.isNew ? '' : 'Разбираюсь в бэкенде, пишу на C# и иногда спорю с TypeScript. Люблю, когда сложное становится понятным.', interests: props.isNew ? '' : 'C#, ASP.NET Core, PostgreSQL, TypeScript' })
const draft = reactive({ ...profile })
const editDialog = ref<HTMLDialogElement | null>(null)
const activeTab = ref<'answers' | 'questions'>('answers')
const saved = ref(false)
const initials = computed(() => profile.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase())
const tags = computed(() => profile.interests.split(',').map(tag => tag.trim()).filter(Boolean))
const level = computed(() => props.account?.level ?? (props.isNew ? 1 : 7))
const xp = computed(() => props.account?.experiencePoints ?? (props.isNew ? 0 : 340))
const answers = [
  { title: 'Как правильно связать Vue и ASP.NET Core?', tag: 'ASP.NET Core', date: 'Сегодня', text: 'Начни с отдельного API и запросов через fetch. Для локальной разработки удобно настроить прокси в Vite, а контракты запросов и ответов описать типами.', accepted: true },
  { title: 'Чем interface отличается от type в TypeScript?', tag: 'TypeScript', date: 'Вчера', text: 'Оба варианта подходят для описания объектов. У interface есть объединение объявлений, а type также позволяет описывать объединения типов, например string | number.', accepted: true },
  { title: 'Где хранить связь между вопросом и его автором?', tag: 'PostgreSQL', date: '20 октября', text: 'В таблице вопросов можно хранить author_id — внешний ключ на пользователя. Он помогает сохранить целостность данных и связывает вопрос с автором.', accepted: false },
]
const questions = [
  { title: 'Как организовать миграции в командном проекте?', tag: 'Базы данных', date: 'Вчера', text: 'Работаем над одним проектом вчетвером. Как договориться о миграциях, чтобы изменения схемы не конфликтовали?', accepted: false },
  { title: 'Что почитать про тестирование API на C#?', tag: 'C#', date: '18 октября', text: 'Хочется начать с интеграционных тестов: проверить регистрацию, авторизацию и доступ к защищённым методам. С чего лучше начать?', accepted: false },
]
const items = computed(() => props.isNew ? [] : activeTab.value === 'answers' ? answers : questions)

function editProfile() {
  Object.assign(draft, profile)
  editDialog.value?.showModal()
}
function saveProfile() {
  if (!draft.name.trim()) return
  Object.assign(profile, { name: draft.name.trim(), group: draft.group.trim(), bio: draft.bio.trim(), interests: draft.interests.trim() })
  saved.value = true
  editDialog.value?.close()
}
</script>

<template>
  <main class="student-page" aria-labelledby="student-title">
    <div class="profile-breadcrumb"><a href="#">Главная</a><span aria-hidden="true">/</span><span>Мой профиль</span><span v-if="!account" class="profile-demo">DEMO</span></div>
    <div class="profile-heading"><div><p class="eyebrow">&gt;_ ЛИЧНОЕ ПРОСТРАНСТВО</p><h1 id="student-title">Твой профиль<span>.</span></h1></div><button v-if="!account" class="button button-outline" type="button" @click="editProfile">Редактировать <span aria-hidden="true">↗</span></button></div>
    <p v-if="saved" class="profile-saved" role="status">Изменения применены в демо. После перезагрузки они сбросятся.</p>
    <div class="student-layout">
      <aside class="profile-sidebar" aria-label="О студенте">
        <section class="student-card">
          <div class="student-avatar" aria-hidden="true">{{ initials }}<span>LVL {{ level }}</span></div>
          <h2>{{ profile.name }}</h2><p class="student-meta">ИТИС · КФУ <span v-if="profile.group">/ {{ profile.group }}</span></p>
          <div class="profile-divider"></div><h3 class="profile-label">О СЕБЕ</h3><p class="student-bio">{{ profile.bio || 'Расскажи о себе: что изучаешь и чем можешь помочь другим.' }}</p>
          <h3 class="profile-label">ИНТЕРЕСЫ</h3><div v-if="tags.length" class="student-tags"><span v-for="tag in tags" :key="tag">{{ tag }}</span></div><p v-else class="student-bio">Добавь языки и технологии, которые тебе интересны.</p>
        </section>
        <section class="profile-tip"><span aria-hidden="true">&lt;/&gt;</span><h3>Знания имеют вес.</h3><p>Помогай другим разбираться в сложном. Каждый полезный ответ — шаг вперёд.</p></section>
      </aside>
      <div class="profile-main">
        <section class="level-card" aria-labelledby="level-title"><div class="level-top"><span class="profile-label">ТВОЙ ПРОГРЕСС</span><span class="level-status">{{ isNew ? 'Начало пути' : 'В деле' }}</span></div><div class="level-summary"><h2 id="level-title">Уровень {{ level }}<span> / {{ isNew ? 'Новичок' : 'Практик' }}</span></h2><span class="xp-value">{{ xp }} <span>/ 500 XP</span></span></div><progress :value="xp" max="500" aria-label="Опыт до следующего уровня"></progress><p>Ещё {{ 500 - xp }} XP до уровня {{ level + 1 }}. {{ isNew ? 'Всё начинается с первого ответа.' : 'Продолжай делиться знаниями.' }}</p></section>
        <section class="profile-stats" aria-label="Статистика"><div><strong>{{ isNew ? 0 : answers.length }}</strong><span>ответа</span></div><div><strong>{{ isNew ? 0 : questions.length }}</strong><span>вопроса</span></div><div><strong>{{ isNew ? 0 : 2 }}</strong><span>принятых ответа</span></div></section>
        <section class="activity-card" aria-labelledby="activity-title"><div class="activity-heading"><h2 id="activity-title">Мой вклад</h2><span>{{ isNew ? 'Начнём с малого' : 'Есть чем поделиться' }}</span></div><div class="activity-tabs" aria-label="Тип активности"><button type="button" :aria-pressed="activeTab === 'answers'" @click="activeTab = 'answers'">Ответы <span>{{ isNew ? 0 : answers.length }}</span></button><button type="button" :aria-pressed="activeTab === 'questions'" @click="activeTab = 'questions'">Вопросы <span>{{ isNew ? 0 : questions.length }}</span></button></div>
          <div v-if="!items.length" class="activity-empty"><span aria-hidden="true">{ }</span><h3>{{ activeTab === 'answers' ? 'Твой первый ответ ещё впереди' : 'Любой вопрос — хорошее начало' }}</h3><p>Здесь появятся твои {{ activeTab === 'answers' ? 'ответы другим студентам' : 'вопросы сообществу' }}.</p></div>
          <div v-else class="activity-list"><details v-for="item in items" :key="item.title" class="activity-item"><summary><span class="activity-meta"><span>{{ item.tag }}</span><span>{{ item.date }}</span></span><span class="activity-title">{{ item.title }}<span class="expand-icon" aria-hidden="true">+</span></span><span v-if="item.accepted" class="accepted-label">✓ Ответ принят</span><span v-else class="activity-hint">{{ activeTab === 'answers' ? 'Посмотреть ответ' : 'Посмотреть вопрос' }}</span></summary><p>{{ item.text }}</p></details></div>
        </section>
        <p v-if="!account" class="profile-demo-note">Демопрофиль · {{ isNew ? 'Данные доступны только в текущем просмотре.' : 'Активность и опыт показаны для примера.' }}</p>
      </div>
    </div>
    <dialog ref="editDialog" class="auth-dialog" aria-labelledby="edit-title" @click="($event.target === editDialog) && editDialog?.close()"><div class="dialog-content"><div class="registration-top"><span class="mock-label">ПРОФИЛЬ / EDIT</span><button type="button" class="close-button" aria-label="Закрыть редактирование" @click="editDialog?.close()">×</button></div><h2 id="edit-title">Немного о тебе</h2><form class="registration-form" @submit.prevent="saveProfile"><div class="form-field"><label for="student-name">Имя и фамилия</label><input id="student-name" v-model="draft.name" required pattern=".*\S.*" maxlength="80" autocomplete="name" /></div><div class="form-field"><label for="student-group">Группа</label><input id="student-group" v-model="draft.group" maxlength="30" placeholder="Например, 11-402" /></div><div class="form-field"><label for="student-bio">О себе</label><textarea id="student-bio" v-model="draft.bio" rows="4" maxlength="400" placeholder="Что изучаешь? Чем увлекаешься?" /></div><div class="form-field"><label for="student-interests">Интересы через запятую</label><input id="student-interests" v-model="draft.interests" maxlength="160" placeholder="C#, Vue, алгоритмы" /></div><p class="mock-note">Изменения сохраняются до перезагрузки страницы.</p><button type="submit" class="button button-primary registration-submit">Сохранить <span aria-hidden="true">↗</span></button></form></div></dialog>
  </main>
</template>
