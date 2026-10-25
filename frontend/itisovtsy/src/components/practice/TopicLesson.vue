<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PracticeTopic } from '../../data/practiceTypes'
import { isAnalysisKind } from '../../data/analysis'
import AnalysisLab from './AnalysisLab.vue'
import LogicLab from './LogicLab.vue'
import StructureLab from './StructureLab.vue'
import CountingLab from './CountingLab.vue'
import StateLab from './StateLab.vue'
const props = defineProps<{ topic: PracticeTopic; subjectTitle: string }>()
const emit = defineEmits<{ completed: [correct: number, total: number] }>()
const mode = ref<'explore' | 'review'>('explore')
const activeCard = ref(0)
const card = computed(() => props.topic.cards[activeCard.value]!)
const queue = ref(props.topic.questions.map((_, i) => i))
const index = ref(0)
const choice = ref<number | null>(null)
const checked = ref(false)
const finished = ref(false)
const scores = ref<boolean[]>([])
const allScores = ref<Record<number, boolean>>({})
const question = computed(() => props.topic.questions[queue.value[index.value]!]!)
const reveal = ref(false)
function check() {
  if (choice.value === null || checked.value) return
  checked.value = true
  const correct = choice.value === question.value.answer
  scores.value[index.value] = correct
  allScores.value[queue.value[index.value]!] = correct
}
function next() {
  if (index.value === queue.value.length - 1) {
    finished.value = true
    emit('completed', Object.values(allScores.value).filter(Boolean).length, props.topic.questions.length)
  } else { index.value++; choice.value = null; checked.value = false }
}
function restart(errorsOnly = false) {
  queue.value = errorsOnly ? queue.value.filter((_, i) => !scores.value[i]) : props.topic.questions.map((_, i) => i)
  if (!errorsOnly) allScores.value = {}
  index.value = 0; choice.value = null; checked.value = false; finished.value = false; scores.value = []
}
</script>
<template>
  <section :aria-label="topic.title">
    <div class="practice-topic"><div><p class="practice-kicker">{{ subjectTitle.toLocaleUpperCase('ru') }} / {{ topic.extra ? 'ДОПОЛНИТЕЛЬНАЯ ТЕМА' : 'ОСНОВНОЙ КУРС' }}</p><h2>{{ topic.title }}</h2></div><div class="practice-modes" aria-label="Режим темы"><button :aria-pressed="mode === 'explore'" @click="mode = 'explore'">Изучить</button><button :aria-pressed="mode === 'review'" @click="mode = 'review'">Повторить</button></div></div>
    <div v-show="mode === 'explore'">
      <div class="operation-cards theory-select" aria-label="Карточки темы"><button v-for="(item, i) in topic.cards" :key="item.title" :aria-pressed="activeCard === i" @click="activeCard = i"><span class="practice-kicker">0{{ i+1 }}</span><strong>{{ item.formula }}</strong><span>{{ item.title }}</span></button></div>
      <div class="practice-lab course-lab"><section class="venn-panel"><div class="practice-panel-top"><h3>{{ topic.experiment }}</h3><span>ИНТЕРАКТИВ</span></div>
        <AnalysisLab v-if="isAnalysisKind(topic.id)" :kind="topic.id" />
        <LogicLab v-else-if="topic.id === 'logic' || topic.id === 'boolean'" :kind="topic.id" />
        <StructureLab v-else-if="topic.id === 'relations' || topic.id === 'functions' || topic.id === 'graphs' || topic.id === 'trees'" :kind="topic.id" />
        <CountingLab v-else-if="topic.id === 'combinatorics' || topic.id === 'proofs' || topic.id === 'recurrence' || topic.id === 'numbers' || topic.id === 'probability'" :kind="topic.id" />
        <StateLab v-else-if="topic.id === 'automata' || topic.id === 'codes'" :kind="topic.id" />
      </section><aside class="operation-explanation theory-explanation" aria-live="polite"><span class="practice-kicker">КАРТОЧКА {{ activeCard+1 }} / {{ topic.cards.length }}</span><h3>{{ card.title }}</h3><div class="card-formula">{{ card.formula }}</div><p>{{ card.explanation }}</p><div class="theory-example"><span class="practice-kicker">ПРИМЕР</span><p>{{ card.example }}</p></div><p class="operation-note">{{ card.caution }}</p></aside></div>
      <div class="topic-challenge"><span class="practice-kicker">↳ ЗАДАНИЕ ДЛЯ ЭКСПЕРИМЕНТА</span><p>{{ topic.challenge }}</p></div>
      <div class="practice-bottom"><p>Теперь попробуй ответить без подсказок.</p><button class="button button-primary" @click="mode = 'review'">К повторению ↗</button></div>
    </div>
    <div v-if="mode === 'review'" class="review-layout"><section class="review-card">
      <template v-if="!finished"><div class="practice-panel-top"><span class="practice-kicker">ПРОВЕРЬ СЕБЯ</span><span>{{ index+1 }} / {{ queue.length }}</span></div><progress :value="index" :max="queue.length" aria-label="Прогресс проверки" /><h3>{{ question.prompt }}</h3><fieldset class="quiz-options" :disabled="checked"><legend>Выбери один ответ</legend><label v-for="(option, i) in question.options" :key="`${index}-${i}`" :class="{ picked: choice === i }"><input v-model="choice" type="radio" :value="i" :name="`quiz-${topic.id}`" /><span>{{ option }}</span></label></fieldset><div v-if="checked" class="answer-feedback" :class="{ correct: choice === question.answer }" role="status"><strong>{{ choice === question.answer ? 'Верно!' : 'Разберём ответ' }}</strong><p>Правильный ответ: {{ question.options[question.answer] }}.</p><p>{{ question.explanation }}</p></div><button v-if="!checked" class="button button-primary" :disabled="choice === null" @click="check">Проверить ответ</button><button v-else class="button button-primary" @click="next">{{ index+1 === queue.length ? 'Посмотреть результат' : 'Следующий вопрос →' }}</button></template>
      <template v-else><p class="practice-kicker">ПРОВЕРКА ЗАВЕРШЕНА</p><h3>{{ scores.filter(Boolean).length }} из {{ queue.length }} — верно</h3><p>{{ scores.every(Boolean) ? 'Все ответы в этой попытке верны. Вернись к эксперименту и объясни закономерность своими словами.' : 'Ошибки показывают, какие правила стоит повторить. Ниже можно пройти только сложные вопросы.' }}</p><div class="review-summary"><p v-for="(questionId, i) in queue" :key="questionId"><span>{{ topic.questions[questionId]!.prompt }}</span><strong>{{ scores[i] ? '✓' : '↺' }}</strong></p></div><div class="review-actions"><button v-if="scores.some(score => !score)" class="button button-primary" @click="restart(true)">Повторить ошибки</button><button class="button button-outline" @click="restart()">Заново</button></div></template>
    </section><aside class="review-reference"><p class="practice-kicker">ВСПОМНИ ПРАВИЛО</p><h3>Карточки темы</h3><p>Сначала сформулируй определение самостоятельно, затем открой объяснения.</p><button class="button button-outline" :aria-expanded="reveal" @click="reveal = !reveal">{{ reveal ? 'Скрыть объяснения' : 'Показать объяснения' }}</button><article v-for="item in topic.cards" :key="item.title"><span>{{ item.title }}</span><p class="reference-formula">{{ item.formula }}</p><p v-if="reveal">{{ item.explanation }}</p></article></aside></div>
  </section>
</template>
