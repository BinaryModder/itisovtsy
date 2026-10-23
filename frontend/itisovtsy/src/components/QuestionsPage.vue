<script setup lang="ts">
import { computed, nextTick, onDeactivated, reactive, ref } from 'vue'
import { demoQuestions, demoUserId, filterQuestions, questionSubjects, toggleAcceptedAnswer, validateQuestion, type Question, type QuestionFilters } from '../data/questions'
import '../assets/questions.css'

const props = defineProps<{ name: string }>()
const questions = ref<Question[]>(structuredClone(demoQuestions))
const filters = reactive<QuestionFilters>({ course: '', subject: '', query: '', status: 'all', sort: 'newest' })
const results = computed(() => filterQuestions(questions.value, filters, demoUserId))
const selected = ref<Question | null>(null)
const composer = ref<HTMLDialogElement | null>(null)
const questionForm = ref<HTMLFormElement | null>(null)
const pageTitle = ref<HTMLHeadingElement | null>(null)
const answerInput = ref<HTMLTextAreaElement | null>(null)
const draft = reactive({ title: '', body: '', course: '1', subject: questionSubjects[0]! })
const errors = reactive({ title: '', body: '' })
const answerText = ref('')
const answerError = ref('')
const notice = ref('')
const statusOptions = [{ value: 'all', label: 'Все вопросы' }, { value: 'unanswered', label: 'Без ответа' }, { value: 'solved', label: 'Решённые' }, { value: 'mine', label: 'Мои вопросы' }] as const
const date = (time: number) => new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(time)
const authorName = (id: string, name: string) => id === demoUserId ? props.name : name
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase()

function resetFilters() { Object.assign(filters, { course: '', subject: '', query: '', status: 'all', sort: 'newest' }) }
async function focusHeading() { await nextTick(); pageTitle.value?.focus({ preventScroll: true }); window.scrollTo(0, 0) }
function openQuestion(question: Question) {
  selected.value = question
  answerText.value = ''
  answerError.value = ''
  notice.value = ''
  void focusHeading()
}
function backToQuestions() { selected.value = null; notice.value = ''; void focusHeading() }
function openComposer() {
  Object.assign(draft, { title: '', body: '', course: filters.course || '1', subject: filters.subject || questionSubjects[0]! })
  Object.assign(errors, { title: '', body: '' })
  composer.value?.showModal()
}
async function publishQuestion() {
  Object.assign(errors, validateQuestion(draft.title, draft.body))
  if (errors.title || errors.body) { await nextTick(); questionForm.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return }
  const question: Question = { id: crypto.randomUUID(), title: draft.title.trim(), body: draft.body.trim(), course: Number(draft.course), subject: draft.subject, authorId: demoUserId, author: props.name, createdAt: Date.now(), answers: [], acceptedAnswerId: null }
  questions.value.unshift(question)
  composer.value?.close()
  resetFilters()
  openQuestion(questions.value[0]!)
  notice.value = 'Вопрос добавлен в демо. Он доступен до перезагрузки страницы.'
}
async function publishAnswer() {
  if (!selected.value) return
  const body = answerText.value.trim()
  if (body.length < 10 || body.length > 5000) { answerError.value = 'Ответ должен содержать от 10 до 5000 символов.'; answerInput.value?.focus(); return }
  const id = crypto.randomUUID()
  selected.value.answers.push({ id, authorId: demoUserId, author: props.name, body, createdAt: Date.now() })
  answerText.value = ''
  answerError.value = ''
  notice.value = 'Ответ добавлен. Спасибо, что делишься знаниями!'
  await nextTick()
  document.getElementById(`answer-${id}`)?.focus()
}
function acceptAnswer(id: string) {
  if (selected.value && toggleAcceptedAnswer(selected.value, id, demoUserId)) notice.value = selected.value.acceptedAnswerId ? 'Ответ отмечен как решение.' : 'Отметка решения снята.'
}
onDeactivated(() => composer.value?.close())
</script>

<template>
  <main class="questions-page" aria-labelledby="questions-title">
    <div class="profile-breadcrumb"><a href="#">Главная</a><span aria-hidden="true">/</span><button v-if="selected" type="button" class="breadcrumb-button" @click="backToQuestions">Вопросы</button><span v-else>Вопросы</span><span v-if="selected">/ Обсуждение</span><span class="profile-demo">DEMO</span></div>
    <template v-if="!selected">
      <div class="profile-heading questions-heading"><div><p class="eyebrow">&gt;_ РАЗБЕРЁМСЯ ВМЕСТЕ</p><h1 id="questions-title" ref="pageTitle" tabindex="-1">Вопросы<span>.</span></h1><p class="library-subtitle">Спроси своих. Помоги другим. Найди решение.</p></div><button class="button button-primary" type="button" @click="openComposer">Задать вопрос <span aria-hidden="true">+</span></button></div>
      <div class="questions-layout"><div class="questions-main">
        <section class="question-filters" aria-label="Фильтры вопросов"><label for="question-search" class="profile-label">ЧТО ХОЧЕШЬ УЗНАТЬ?</label><input id="question-search" v-model="filters.query" class="question-search" type="search" placeholder="Найти вопрос, тему или предмет…" /><div class="course-filter" aria-label="Фильтр по курсу"><button type="button" :aria-pressed="filters.course === ''" @click="filters.course = ''">Все курсы</button><button v-for="course in 4" :key="course" type="button" :aria-pressed="filters.course === String(course)" @click="filters.course = String(course)">{{ course }} курс</button></div><div class="question-selects"><div class="form-field"><label for="question-subject">Предмет</label><select id="question-subject" v-model="filters.subject"><option value="">Все предметы</option><option v-for="subject in questionSubjects" :key="subject">{{ subject }}</option></select></div><div class="form-field"><label for="question-sort">Сортировка</label><select id="question-sort" v-model="filters.sort"><option value="newest">Сначала новые</option><option value="active">Больше ответов</option></select></div></div></section>
        <div class="question-status-tabs" aria-label="Статус вопросов"><button v-for="option in statusOptions" :key="option.value" type="button" :aria-pressed="filters.status === option.value" @click="filters.status = option.value">{{ option.label }}</button></div>
        <div class="library-results-heading"><p role="status">Найдено вопросов: <strong>{{ results.length }}</strong></p><button class="library-reset" type="button" @click="resetFilters">Сбросить фильтры ↺</button></div>
        <div v-if="results.length" class="question-list"><article v-for="question in results" :key="question.id" class="question-card"><div class="question-card-top"><div class="question-tags"><span>{{ question.course }} курс</span><span>{{ question.subject }}</span></div><span v-if="question.acceptedAnswerId" class="question-solved">✓ Решён</span></div><h2><button type="button" @click="openQuestion(question)">{{ question.title }}</button></h2><p class="question-excerpt">{{ question.body }}</p><div class="question-card-bottom"><span class="question-author"><span class="mini-avatar" aria-hidden="true">{{ initials(authorName(question.authorId, question.author)) }}</span>{{ authorName(question.authorId, question.author) }}</span><time :datetime="new Date(question.createdAt).toISOString()">{{ date(question.createdAt) }}</time><button class="answer-count" type="button" :aria-label="`Открыть обсуждение: ${question.title}`" @click="openQuestion(question)">{{ question.answers.length ? `Ответов: ${question.answers.length}` : 'Ответить первым' }} ↗</button></div></article></div>
        <div v-else class="library-empty"><span aria-hidden="true">{ ? }</span><h2>Здесь пока тихо</h2><p>Измени фильтры или задай свой вопрос.</p><button class="button button-outline" type="button" @click="resetFilters">Показать все вопросы</button></div>
      </div><aside class="questions-sidebar"><section class="question-tip"><span aria-hidden="true">&gt;_</span><h2>Хороший вопрос —<br />половина решения.</h2><ol><li>Дай понятный заголовок.</li><li>Расскажи, что уже пробовал.</li><li>Добавь пример или текст ошибки.</li></ol><p>Когда разберёшься, отметь ответ, который помог.</p></section><section class="question-demo-card"><span class="mock-label">ТВОЁ МЕСТО В ДЕМО</span><p>{{ name }}</p><span>Можно спрашивать и отвечать. Отмечать решение может только автор вопроса.</span></section></aside></div>
    </template>
    <template v-else>
      <div class="discussion-heading"><button type="button" class="library-reset" @click="backToQuestions">← К вопросам</button><div class="question-tags"><span>{{ selected.course }} курс</span><span>{{ selected.subject }}</span><span v-if="selected.acceptedAnswerId">✓ Решён</span></div><h1 id="questions-title" ref="pageTitle" tabindex="-1">{{ selected.title }}</h1><p class="discussion-byline">{{ authorName(selected.authorId, selected.author) }} · {{ date(selected.createdAt) }}</p></div>
      <div class="discussion-layout"><div class="discussion-main"><section class="question-body" aria-label="Описание вопроса"><p>{{ selected.body }}</p></section><p v-if="notice" class="profile-saved" role="status">{{ notice }}</p><h2 class="answers-heading">Ответы <span>{{ selected.answers.length }}</span></h2><p v-if="!selected.answers.length" class="no-answers">Пока без ответа. Если знаешь решение — поделись им ниже.</p><article v-for="answer in selected.answers" :id="`answer-${answer.id}`" :key="answer.id" class="discussion-answer" :class="{ 'is-accepted': selected.acceptedAnswerId === answer.id }" tabindex="-1"><div class="answer-top"><span class="question-author"><span class="mini-avatar" aria-hidden="true">{{ initials(authorName(answer.authorId, answer.author)) }}</span>{{ authorName(answer.authorId, answer.author) }}</span><span v-if="selected.acceptedAnswerId === answer.id" class="question-solved">✓ Решение</span></div><p>{{ answer.body }}</p><div class="answer-bottom"><time :datetime="new Date(answer.createdAt).toISOString()">{{ date(answer.createdAt) }}</time><button v-if="selected.authorId === demoUserId" class="accept-button" type="button" :aria-pressed="selected.acceptedAnswerId === answer.id" @click="acceptAnswer(answer.id)">{{ selected.acceptedAnswerId === answer.id ? 'Снять отметку решения' : 'Отметить решением' }}</button></div></article>
      <form class="answer-composer" @submit.prevent="publishAnswer"><h2>Твой ответ<span>.</span></h2><p>Объясни ход мысли — это полезнее, чем просто результат.</p><div class="form-field"><label for="answer-body">Ответ от {{ name }}</label><textarea id="answer-body" ref="answerInput" v-model="answerText" rows="7" maxlength="5000" required placeholder="Вот как можно разобраться…" :aria-invalid="Boolean(answerError)" :aria-describedby="answerError ? 'answer-error' : 'answer-note'" @input="answerError = ''" /><span v-if="answerError" id="answer-error" class="field-error" role="alert">{{ answerError }}</span></div><div class="answer-submit"><span id="answer-note">Обычный текст · {{ answerText.length }} / 5000</span><button class="button button-primary" type="submit">Ответить ↗</button></div></form></div><aside class="questions-sidebar"><section class="question-tip"><span aria-hidden="true">&lt;/&gt;</span><h2>Делись пониманием.</h2><p>Приводи примеры, объясняй шаги и уважай тех, кто только начинает.</p></section></aside></div>
    </template>
    <p class="profile-demo-note">Демообсуждения. Вопросы и ответы сохраняются только в текущей вкладке до перезагрузки. Опыт пока не начисляется.</p>
    <dialog ref="composer" class="auth-dialog question-dialog" aria-labelledby="ask-title" @click="($event.target === composer) && composer?.close()"><div class="dialog-content"><div class="registration-top"><span class="mock-label">НОВЫЙ ВОПРОС / DEMO</span><button type="button" class="close-button" aria-label="Закрыть форму вопроса" @click="composer?.close()">×</button></div><h2 id="ask-title">Давай разберёмся<span>.</span></h2><p>Сформулируй вопрос, а сообщество поможет с ответом.</p><form ref="questionForm" class="registration-form" novalidate @submit.prevent="publishQuestion"><div class="form-field"><label for="ask-title-input">Заголовок</label><input id="ask-title-input" v-model="draft.title" autofocus required maxlength="140" placeholder="Что именно не получается?" :aria-invalid="Boolean(errors.title)" :aria-describedby="errors.title ? 'ask-title-error' : undefined" @input="errors.title = ''" /><span v-if="errors.title" id="ask-title-error" class="field-error">{{ errors.title }}</span></div><div class="question-selects"><div class="form-field"><label for="ask-course">Курс</label><select id="ask-course" v-model="draft.course"><option v-for="course in 4" :key="course" :value="String(course)">{{ course }} курс</option></select></div><div class="form-field"><label for="ask-subject">Предмет</label><select id="ask-subject" v-model="draft.subject"><option v-for="subject in questionSubjects" :key="subject">{{ subject }}</option></select></div></div><div class="form-field"><label for="ask-body">Подробности</label><textarea id="ask-body" v-model="draft.body" rows="7" maxlength="5000" required placeholder="Опиши задачу и то, что уже удалось попробовать…" :aria-invalid="Boolean(errors.body)" :aria-describedby="errors.body ? 'ask-body-error' : undefined" @input="errors.body = ''" /><span v-if="errors.body" id="ask-body-error" class="field-error">{{ errors.body }}</span></div><p class="mock-note">Вопрос появится в демокаталоге от имени {{ name }}. Данные никуда не отправляются.</p><button class="button button-primary registration-submit" type="submit">Задать вопрос <span aria-hidden="true">↗</span></button></form></div></dialog>
  </main>
</template>
