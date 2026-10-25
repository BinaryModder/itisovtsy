<script setup lang="ts">
import { computed, ref } from 'vue'


const emit = defineEmits<{ completed: [correct: number, total: number] }>()
const allScores = ref<Record<number, boolean>>({})

type Operation = 'intersection' | 'union' | 'difference' | 'complement'
const operations: { id: Operation; title: string; formula: string; definition: string; hint: string; mistake: string }[] = [
  { id: 'intersection', title: 'Пересечение', formula: 'A ∩ B', definition: 'Элементы, которые одновременно входят и в A, и в B.', hint: 'Убери число 3 из множества B. Останется ли оно в пересечении?', mistake: '«И» означает принадлежность обоим множествам одновременно.' },
  { id: 'union', title: 'Объединение', formula: 'A ∪ B', definition: 'Элементы, которые входят хотя бы в одно из двух множеств.', hint: 'Добавь число 6 в оба множества. Сколько раз оно появится в результате?', mistake: 'Общие элементы записываются один раз. Повторов в множестве нет.' },
  { id: 'difference', title: 'Разность', formula: 'A ∖ B', definition: 'Элементы множества A, которые не входят в B.', hint: 'Поменяй A и B местами. Всегда ли результат остаётся прежним?', mistake: 'Порядок важен: A ∖ B и B ∖ A могут быть разными множествами.' },
  { id: 'complement', title: 'Дополнение', formula: 'U ∖ A', definition: 'Все элементы универсального множества U, которые не входят в A.', hint: 'Меняй состав B. Влияет ли он на дополнение A?', mistake: 'Дополнение зависит от выбранного U. Здесь U = {1, 2, 3, 4, 5, 6}.' },
]
const universe = [1, 2, 3, 4, 5, 6]
const setA = ref([1, 2, 3])
const setB = ref([3, 4, 5])
const active = ref<Operation>('intersection')
const mode = ref<'explore' | 'review'>('explore')
const current = computed(() => operations.find(item => item.id === active.value)!)
function includes(op: Operation, a: boolean, b: boolean) {
  return op === 'intersection' ? a && b : op === 'union' ? a || b : op === 'difference' ? a && !b : !a
}
function calculate(op: Operation, a: number[], b: number[]) {
  return universe.filter(n => includes(op, a.includes(n), b.includes(n)))
}
const result = computed(() => calculate(active.value, setA.value, setB.value))
const format = (values: number[]) => values.length ? `{ ${[...values].sort((a, b) => a - b).join(', ')} }` : '∅'
function reset() { setA.value = [1, 2, 3]; setB.value = [3, 4, 5] }
const regions = computed(() => [
  { key: 'outside', a: false, b: false, x: 280, y: 268 },
  { key: 'a', a: true, b: false, x: 170, y: 155 },
  { key: 'both', a: true, b: true, x: 280, y: 155 },
  { key: 'b', a: false, b: true, x: 390, y: 155 },
].map(region => ({ ...region, values: universe.filter(n => setA.value.includes(n) === region.a && setB.value.includes(n) === region.b) })))
const questions: { op: Operation; a: number[]; b: number[] }[] = [
  { op: 'intersection', a: [1, 3, 5], b: [2, 3, 5] },
  { op: 'union', a: [1, 2], b: [2, 4] },
  { op: 'difference', a: [2, 4, 6], b: [1, 4, 6] },
  { op: 'complement', a: [1, 3, 5], b: [2, 3] },
]
const questionIndex = ref(0)
const selected = ref<number[]>([])
const checked = ref(false)
const scores = ref<boolean[]>([])
const finished = ref(false)
const retryOnly = ref(false)
const queue = ref(questions.map((_, i) => i))
const question = computed(() => questions[queue.value[questionIndex.value]!]!)
const questionOperation = computed(() => operations.find(item => item.id === question.value.op)!)
const expected = computed(() => calculate(question.value.op, question.value.a, question.value.b))
const correct = computed(() => selected.value.length === expected.value.length && selected.value.every(n => expected.value.includes(n)))
const reveal = ref(false)
function check() { checked.value = true; scores.value[questionIndex.value] = correct.value; allScores.value[queue.value[questionIndex.value]!] = correct.value }
function next() {
  if (questionIndex.value === queue.value.length - 1) { finished.value = true; emit('completed', Object.values(allScores.value).filter(Boolean).length, questions.length); return }
  questionIndex.value++; selected.value = []; checked.value = false
}
function restart(onlyMistakes = false) {
  if (!onlyMistakes) allScores.value = {}
  const mistakes = queue.value.filter((_, i) => !scores.value[i])
  queue.value = onlyMistakes ? mistakes : questions.map((_, i) => i)
  retryOnly.value = onlyMistakes; questionIndex.value = 0; selected.value = []; checked.value = false; scores.value = []; finished.value = false
}
</script>
<template>
<section aria-label="Множества и операции">
      <div class="practice-topic"><div><p class="practice-kicker">ДИСКРЕТНАЯ МАТЕМАТИКА / 01</p><h2>Множества и операции</h2></div><div class="practice-modes" aria-label="Режим практикума"><button :aria-pressed="mode === 'explore'" @click="mode = 'explore'">Изучить</button><button :aria-pressed="mode === 'review'" @click="mode = 'review'">Повторить</button></div></div>
      <template v-if="mode === 'explore'">
        <div class="operation-cards" aria-label="Выбор операции"><button v-for="(operation, index) in operations" :key="operation.id" :aria-pressed="active === operation.id" @click="active = operation.id"><span class="practice-kicker">0{{ index + 1 }}</span><strong>{{ operation.formula }}</strong><span>{{ operation.title }}</span></button></div>
        <div class="practice-lab">
          <section class="venn-panel" aria-labelledby="experiment-title"><div class="practice-panel-top"><h3 id="experiment-title">Лаборатория множеств</h3><span>U = {1, 2, 3, 4, 5, 6}</span></div>
            <svg class="venn" viewBox="0 0 560 310" role="img" :aria-label="`${current.title}. A = ${format(setA)}, B = ${format(setB)}. Результат: ${format(result)}`">
              <defs><mask id="practice-not-a"><rect width="560" height="310" fill="white" /><circle cx="220" cy="150" r="100" fill="black" /></mask><mask id="practice-not-b"><rect width="560" height="310" fill="white" /><circle cx="340" cy="150" r="100" fill="black" /></mask><clipPath id="practice-in-b"><circle cx="340" cy="150" r="100" /></clipPath></defs>
              <rect x="14" y="14" width="532" height="282" rx="12" fill="#fff" stroke="#d6dfea" />
              <g mask="url(#practice-not-a)"><rect v-if="includes(active, false, false)" x="15" y="15" width="530" height="280" rx="11" fill="#cadcf7" mask="url(#practice-not-b)" /></g>
              <circle cx="220" cy="150" r="100" :fill="includes(active, true, false) ? '#cadcf7' : '#f8fafc'" mask="url(#practice-not-b)" />
              <circle cx="340" cy="150" r="100" :fill="includes(active, false, true) ? '#cadcf7' : '#f8fafc'" mask="url(#practice-not-a)" />
              <circle cx="220" cy="150" r="100" :fill="includes(active, true, true) ? '#cadcf7' : '#f8fafc'" clip-path="url(#practice-in-b)" />
              <circle cx="220" cy="150" r="100" fill="none" stroke="#46658d" stroke-width="2" /><circle cx="340" cy="150" r="100" fill="none" stroke="#46658d" stroke-width="2" stroke-dasharray="6 4" />
              <g fill="#14254b" font-size="16"><text x="32" y="40">U</text><text x="170" y="82">A</text><text x="380" y="82">B</text><text v-for="region in regions" :key="region.key" :x="region.x" :y="region.y" text-anchor="middle" :font-size="region.values.length > 4 ? 12 : 15">{{ region.values.join(', ') || '∅' }}</text></g>
            </svg>
            <p class="venn-caption"><span aria-hidden="true"></span>Закрашена область результата. Числа показаны по принадлежности множествам.</p>
            <div class="set-editor"><fieldset v-for="set in ['A', 'B'] as const" :key="set"><legend>Множество {{ set }}</legend><label v-for="n in universe" :key="n"><input v-if="set === 'A'" v-model="setA" type="checkbox" :value="n" /><input v-else v-model="setB" type="checkbox" :value="n" /><span>{{ n }}</span></label></fieldset></div>
            <div class="lab-actions"><button class="library-reset" @click="[setA, setB] = [setB, setA]">Поменять A и B ↔</button><button class="library-reset" @click="reset">Сбросить пример ↺</button></div>
          </section>
          <aside class="operation-explanation"><span class="practice-kicker">{{ current.title }}</span><h3>{{ current.formula }}</h3><p>{{ current.definition }}</p><div class="live-result" aria-live="polite"><span>РЕЗУЛЬТАТ</span><strong>{{ current.formula }} = {{ format(result) }}</strong><span>Элементов: {{ result.length }}</span></div><div class="experiment-prompt"><span>↳ ПОПРОБУЙ</span><p>{{ current.hint }}</p></div><p class="operation-note">{{ current.mistake }}</p></aside>
        </div>
        <div class="practice-bottom"><p>Кажется, разобрался? Проверь себя без подсветки.</p><button class="button button-primary" @click="mode = 'review'">К повторению ↗</button></div>
      </template>
      <template v-else>
        <div class="review-layout"><section class="review-card" aria-labelledby="review-title">
          <template v-if="!finished"><div class="practice-panel-top"><span class="practice-kicker">{{ retryOnly ? 'РАБОТА НАД ОШИБКАМИ' : 'ПРОВЕРЬ СЕБЯ' }}</span><span>{{ questionIndex + 1 }} / {{ queue.length }}</span></div><progress :value="questionIndex" :max="queue.length" aria-label="Прогресс проверки" /><h3 id="review-title">Найди {{ questionOperation.formula }}</h3><p>U = {{ format(universe) }}</p><div class="question-sets"><span>A = {{ format(question.a) }}</span><span>B = {{ format(question.b) }}</span></div><p>Выбери все элементы результата. Для пустого множества оставь все числа невыбранными.</p><fieldset class="answer-options" :disabled="checked"><legend class="practice-kicker">ТВОЙ ОТВЕТ</legend><label v-for="n in universe" :key="n"><input v-model="selected" type="checkbox" :value="n" /><span>{{ n }}</span></label></fieldset><p>Выбрано: {{ format(selected) }}</p><div v-if="checked" class="answer-feedback" :class="{ correct }" role="status"><strong>{{ correct ? 'Верно. Так держать!' : 'Пока не совсем. Разберёмся.' }}</strong><p>{{ questionOperation.definition }}</p><p>{{ questionOperation.formula }} = {{ format(expected) }}</p></div><button v-if="!checked" class="button button-primary" @click="check">Проверить ответ</button><button v-else class="button button-primary" @click="next">{{ questionIndex + 1 === queue.length ? 'Посмотреть результат' : 'Следующее задание →' }}</button></template>
          <template v-else><p class="practice-kicker">ПОВТОРЕНИЕ ЗАВЕРШЕНО</p><h3 id="review-title">{{ scores.filter(Boolean).length }} из {{ queue.length }} — верно</h3><p>{{ scores.every(Boolean) ? 'Все операции освоены в этой проверке. Попробуй свои примеры в лаборатории.' : 'Вернись к сложным операциям и закрепи их ещё одной попыткой.' }}</p><div class="review-summary"><p v-for="(index, position) in queue" :key="index"><span>{{ operations.find(op => op.id === questions[index]!.op)!.title }}</span><strong>{{ scores[position] ? '✓ Верно' : '↺ Повторить' }}</strong></p></div><div class="review-actions"><button v-if="scores.some(score => !score)" class="button button-primary" @click="restart(true)">Повторить ошибки</button><button class="button button-outline" @click="restart()">Начать заново</button></div></template>
        </section><aside class="review-reference"><p class="practice-kicker">КАРТОЧКИ ДЛЯ ПОВТОРЕНИЯ</p><h3>Вспомни правило</h3><p>Попробуй объяснить каждую операцию своими словами, затем открой определения.</p><button class="button button-outline" :aria-expanded="reveal" @click="reveal = !reveal">{{ reveal ? 'Скрыть определения' : 'Показать определения' }}</button><article v-for="op in operations" :key="op.id"><strong>{{ op.formula }}</strong><span>{{ op.title }}</span><p v-if="reveal">{{ op.definition }}</p></article></aside></div>
      </template>

</section>
</template>
