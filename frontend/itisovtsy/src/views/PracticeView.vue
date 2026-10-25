<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { discreteTopics } from '../data/discrete'
import { analysisTopics } from '../data/analysis'
import SetLesson from '../components/practice/SetLesson.vue'
import TopicLesson from '../components/practice/TopicLesson.vue'
import '../assets/practice.css'
const subjects = [
  { id: 'discrete', title: 'Дискретная математика', symbol: 'A ∩ B', description: 'От множеств и логики до графов, автоматов и кодов.', placeholder: 'Графы, кванторы, комбинаторика…', topics: discreteTopics, sources: [
    { title: 'Дискретная математика, НИУ ВШЭ', url: 'https://www.hse.ru/edu/courses/1048924060' },
    { title: 'Mathematics for Computer Science, MIT', url: 'https://ocw.mit.edu/courses/6-1200j-mathematics-for-computer-science-spring-2024/pages/syllabus/' },
    { title: 'Расширенный курс НИУ ВШЭ', url: 'https://www.hse.ru/edu/courses/1071121701' },
  ] },
  { id: 'analysis', title: 'Математический анализ', symbol: '∫ f dx', description: 'От пределов и касательных до интегралов, рядов и градиента.', placeholder: 'Пределы, производная, интегралы…', topics: analysisTopics, sources: [
    { title: 'Single Variable Calculus, MIT', url: 'https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/pages/syllabus/' },
    { title: 'Multivariable Calculus, MIT', url: 'https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/pages/syllabus/' },
  ] },
]
const subjectId = ref<string | null>(null)
const subject = computed(() => subjects.find(item => item.id === subjectId.value))
const selected = ref<string | null>(null)
const search = ref('')
const category = ref('all')
const heading = ref<HTMLElement | null>(null)
const progress = ref<Record<string, { correct: number; total: number }>>({})
const sets = { id: 'sets', title: 'Множества и операции', symbol: 'A ∩ B', description: 'Объединение, пересечение, разность и дополнение на диаграмме Венна.', extra: false }
const catalog = computed(() => subject.value ? [...(subjectId.value === 'discrete' ? [sets] : []), ...subject.value.topics] : [])
const filtered = computed(() => catalog.value.filter(topic => (category.value === 'all' || Boolean(topic.extra) === (category.value === 'extra')) && `${topic.title} ${topic.description}`.toLocaleLowerCase('ru').includes(search.value.trim().toLocaleLowerCase('ru'))))
const topic = computed(() => subject.value?.topics.find(item => item.id === selected.value))
const progressKey = (id: string) => `${subjectId.value}:${id}`
const completedCount = computed(() => catalog.value.filter(item => progress.value[progressKey(item.id)]).length)
const totals = computed(() => subjects.reduce((sum, item) => ({ topics: sum.topics+item.topics.length+(item.id === 'discrete' ? 1 : 0), cards: sum.cards+item.topics.reduce((count,t) => count+t.cards.length,0)+(item.id === 'discrete' ? 4 : 0) }), {topics:0,cards:0}))
async function focusHeading() { await nextTick(); heading.value?.focus({ preventScroll: true }) }
function openSubject(id: string | null) { selected.value = null; subjectId.value = id; search.value = ''; category.value = 'all'; void focusHeading() }
function openTopic(id: string | null) { selected.value = id; void focusHeading() }
function complete(id: string, correct: number, total: number) { progress.value[progressKey(id)] = { correct, total } }
</script>
<template>
  <main class="practice-page" aria-labelledby="practice-title">
    <div class="profile-breadcrumb"><RouterLink to="/">Главная</RouterLink><span>/</span><span>Практикум</span><span class="profile-demo">DEMO</span></div>
    <div class="practice-heading"><div><p class="eyebrow">&gt;_ ЗНАНИЯ В ДЕЙСТВИИ</p><h1 id="practice-title" ref="heading" tabindex="-1">Понять. Попробовать.<br /><span>Запомнить.</span></h1><p>Исследуй закономерности и возвращайся к ним перед контрольной.</p></div><span class="practice-heading-art" aria-hidden="true">{{ subjectId === 'analysis' ? '∫ dx' : '{ ∩ }' }}</span></div>
    <template v-if="!subject">
      <div class="practice-section-label"><h2>Выбери предмет</h2><span>ТЕМ: {{ totals.topics }} / КАРТОЧЕК: {{ totals.cards }}</span></div>
      <div class="subject-catalog"><button v-for="item in subjects" :key="item.id" class="subject-card" type="button" @click="openSubject(item.id)"><span class="subject-symbol" aria-hidden="true">{{ item.symbol }}</span><span><span class="practice-kicker">УНИВЕРСИТЕТСКИЙ КУРС</span><strong>{{ item.title }}</strong><span class="subject-description">{{ item.description }}<br />Лабораторий: {{ item.topics.length+(item.id === 'discrete' ? 1 : 0) }} · Вопросов: {{ item.topics.reduce((sum,t) => sum+t.questions.length,0)+(item.id === 'discrete' ? 4 : 0) }}</span></span><span class="subject-arrow" aria-hidden="true">↗</span></button></div>
      <div class="practice-intro"><article><span>01 / ИССЛЕДУЙ</span><h3>Меняй условия</h3><p>Строй графики и наблюдай, как параметры влияют на результат.</p></article><article><span>02 / РАЗБЕРИСЬ</span><h3>Связывай с формулой</h3><p>Изучай определения, примеры и условия применения.</p></article><article><span>03 / ПРОВЕРЬ СЕБЯ</span><h3>Повтори без подсказок</h3><p>Отвечай на вопросы и возвращайся к своим ошибкам.</p></article></div>
    </template>
    <template v-else-if="!selected">
      <button class="library-reset" @click="openSubject(null)">← К предметам</button>
      <div class="practice-topic"><div><p class="practice-kicker">КАРТА КУРСА</p><h2>{{ subject.title }}</h2></div><span class="course-progress">Пройдено проверок: {{ completedCount }} / {{ catalog.length }}</span></div>
      <p class="course-description">Базовый обзор университетских тем. Выбирай любую тему: в каждой есть эксперимент, карточки и проверка. Состав и глубина курса зависят от программы вуза.</p>
      <div class="catalog-controls"><label class="lab-field">Найти тему<input v-model="search" type="search" :placeholder="subject.placeholder" /></label><label class="lab-field">Раздел<select v-model="category"><option value="all">Все темы</option><option value="core">Основной курс</option><option value="extra">Дополнительные темы</option></select></label></div>
      <p class="catalog-count" role="status">Найдено тем: {{ filtered.length }}</p>
      <div class="topic-catalog"><button v-for="item in filtered" :key="item.id" class="topic-tile" @click="openTopic(item.id)"><span class="topic-tile-top"><span class="practice-kicker">{{ item.extra ? 'ДОПОЛНИТЕЛЬНО' : 'ОСНОВНОЙ КУРС' }}</span><span aria-hidden="true">↗</span></span><span class="topic-symbol">{{ item.symbol }}</span><strong>{{ item.title }}</strong><span class="topic-description">{{ item.description }}</span><span class="topic-tile-bottom">{{ progress[progressKey(item.id)] ? `Последняя проверка: ${progress[progressKey(item.id)]!.correct}/${progress[progressKey(item.id)]!.total}` : 'Эксперимент · Карточки · Проверка' }}</span></button></div>
      <div v-if="!filtered.length" class="library-empty"><h3>Такая тема не найдена</h3><p>Попробуй другое название или открой весь каталог.</p><button class="button button-outline" @click="search = ''; category = 'all'">Сбросить поиск</button></div>
      <details class="course-sources"><summary>О программе и источниках</summary><p>Демо охватывает основные направления, но не заменяет полный курс и доказательства на занятиях. Лаборатории показывают выбранные понятия; дополнительные определения вынесены в карточки.</p><p>Охват тем сверён с учебными программами:</p><ul><li v-for="source in subject.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noreferrer">{{ source.title }}</a></li></ul><p>Деление на основной курс и дополнительные темы здесь служит навигации.</p></details>
    </template>
    <button v-if="selected" class="library-reset" @click="openTopic(null)">← Ко всем темам: {{ subject?.title }}</button>
    <KeepAlive>
      <SetLesson v-if="subjectId === 'discrete' && selected === 'sets'" key="discrete:sets" @completed="(correct, total) => complete('sets', correct, total)" />
      <TopicLesson v-else-if="topic && subject" :key="`${subject.id}:${topic.id}`" :topic="topic" :subject-title="subject.title" @completed="(correct, total) => complete(topic!.id, correct, total)" />
    </KeepAlive>
    <p v-if="subject" class="practice-demo-note">Демонстрационный практикум · Эксперименты и прогресс сохраняются при переходах между предметами и темами до перезагрузки страницы.</p>
  </main>
</template>
