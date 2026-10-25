<script setup lang="ts">
import { computed, ref } from 'vue'
import { choose, euclid, selectionExamples, selections, sequence } from '../../data/discreteMath'
defineProps<{ kind: 'combinatorics' | 'proofs' | 'recurrence' | 'numbers' | 'probability' }>()
const n = ref(4), k = ref(2), ordered = ref(false), repeated = ref(false)
const count = computed(() => selections(n.value, k.value, ordered.value, repeated.value))
const examples = computed(() => selectionExamples(n.value, k.value, ordered.value, repeated.value))
const formula = computed(() => ordered.value ? repeated.value ? 'nᵏ' : 'n! / (n−k)!' : repeated.value ? 'C(n+k−1, k)' : 'C(n, k)')
const square = ref(4)
const cells = computed(() => Array.from({ length: square.value ** 2 }, (_, i) => ({ x: i % square.value, y: Math.floor(i / square.value) })))
const sequenceKind = ref('fibonacci'), first = ref(0), second = ref(1), factor = ref(2)
const terms = computed(() => sequence(sequenceKind.value, first.value, second.value, factor.value))
const maxTerm = computed(() => Math.max(1, ...terms.value.map(Math.abs)))
const a = ref(48), b = ref(18)
const gcd = computed(() => euclid(a.value, b.value))
const step = ref(1)
const visibleSteps = computed(() => gcd.value.steps.slice(0, step.value))
const sum = ref(7), firstDie = ref(0)
const dice = Array.from({ length: 36 }, (_, i) => ({ a: Math.floor(i / 6) + 1, b: i % 6 + 1 }))
const outcomes = computed(() => dice.filter(d => !firstDie.value || d.a === firstDie.value))
const favorable = computed(() => outcomes.value.filter(d => d.a + d.b === sum.value).length)
</script>
<template>
  <div class="discrete-lab">
    <template v-if="kind === 'combinatorics'">
      <div class="lab-fields"><label class="lab-field">Объектов n: {{ n }}<input v-model.number="n" type="range" min="1" max="7" /></label><label class="lab-field">Выбираем k: {{ k }}<input v-model.number="k" type="range" min="0" max="5" /></label></div>
      <div class="lab-toggles"><label><input v-model="ordered" type="checkbox" /> Порядок важен</label><label><input v-model="repeated" type="checkbox" /> Повторения разрешены</label></div>
      <div class="numeric-result" aria-live="polite"><span>{{ formula }}</span><strong>{{ count }}</strong><span>вариантов</span></div>
      <p v-if="!repeated && k > n">Выбрать {{ k }} различных объектов из {{ n }} невозможно: вариантов нет.</p>
      <p v-else-if="k === 0">Есть ровно один способ ничего не выбрать — пустая выборка.</p>
      <p v-else>{{ count > 24 ? 'Первые 24 варианта' : 'Все варианты' }} {{ ordered ? '(последовательности)' : '(порядок внутри выборки не важен)' }}:</p>
      <div class="selection-examples"><span v-for="(example, i) in examples" :key="i">{{ example }}</span></div>
      <details class="lab-details"><summary>Треугольник Паскаля до строки 6</summary><p v-for="row in 7" :key="row" class="pascal-row">{{ Array.from({length: row}, (_, i) => choose(row-1, i)).join('　') }}</p><p>Каждое внутреннее число — сумма двух чисел над ним.</p></details>
    </template>
    <template v-else-if="kind === 'proofs'">
      <label class="lab-field">Размер квадрата n = {{ square }}<input v-model.number="square" type="range" min="1" max="8" /></label>
      <svg viewBox="0 0 330 300" class="math-svg" role="img" :aria-label="`Квадрат ${square} на ${square}; новый слой содержит ${2*square-1} клеток`"><rect v-for="(cell, i) in cells" :key="i" :x="35+cell.x*30" :y="25+cell.y*30" width="27" height="27" rx="3" :fill="Math.max(cell.x, cell.y) === square-1 ? '#14254b' : '#c9daf2'" /></svg>
      <div class="formula-output" aria-live="polite"><p>{{ Array.from({ length: square }, (_, i) => 2*i+1).join(' + ') }} = {{ square ** 2 }} = {{ square }}²</p><p>Новый тёмный слой: 2 × {{ square }} − 1 = {{ 2*square-1 }} клеток.</p></div>
      <details class="lab-details"><summary>Открыть общий индукционный переход</summary><p>База: при n=1 сумма равна 1². Предположим, что сумма первых n нечётных чисел равна n². Следующее нечётное число — 2n+1, поэтому новая сумма n²+2n+1=(n+1)². Переход верен для любого n≥1.</p></details>
    </template>
    <template v-else-if="kind === 'recurrence'">
      <label class="lab-field">Правило<select v-model="sequenceKind"><option value="fibonacci">aₙ = aₙ₋₁ + aₙ₋₂</option><option value="arithmetic">aₙ = aₙ₋₁ + d</option><option value="geometric">aₙ = q · aₙ₋₁</option></select></label>
      <div class="lab-fields"><label class="lab-field">a₀ = {{ first }}<input v-model.number="first" type="range" min="0" max="5" /></label><label v-if="sequenceKind === 'fibonacci'" class="lab-field">a₁ = {{ second }}<input v-model.number="second" type="range" min="0" max="5" /></label><label v-else class="lab-field">{{ sequenceKind === 'arithmetic' ? 'd' : 'q' }} = {{ factor }}<input v-model.number="factor" type="range" min="1" max="4" /></label></div>
      <div class="sequence-bars" role="img" :aria-label="`Члены с индексами 0–8: ${terms.join(', ')}`"><div v-for="(term, i) in terms" :key="i"><span>{{ term }}</span><i :style="{ height: `${Math.max(2, term/maxTerm*150)}px` }"></i><small>{{ i }}</small></div></div>
      <div class="formula-output" aria-live="polite"><p>a₀…a₈ = {{ terms.join(', ') }}</p><p v-if="sequenceKind === 'fibonacci'">a₈ = a₇ + a₆ = {{ terms[7] }} + {{ terms[6] }} = {{ terms[8] }}</p><p v-else-if="sequenceKind === 'arithmetic'">aₙ = {{ first }} + n × {{ factor }}</p><p v-else>aₙ = {{ first }} × {{ factor }}ⁿ</p></div>
    </template>
    <template v-else-if="kind === 'numbers'">
      <div class="lab-fields"><label class="lab-field">a = {{ a }}<input v-model.number="a" type="range" min="1" max="100" @input="step = 1" /></label><label class="lab-field">b = {{ b }}<input v-model.number="b" type="range" min="1" max="100" @input="step = 1" /></label></div>
      <ol class="euclid-steps"><li v-for="(line, i) in visibleSteps" :key="i">{{ line.a }} = {{ line.q }} × {{ line.b }} + <strong>{{ line.r }}</strong></li></ol>
      <button v-if="step < gcd.steps.length" class="button button-outline" @click="step++">Следующее деление →</button><div v-else class="numeric-result" role="status"><span>НОД({{ a }}, {{ b }})</span><strong>{{ gcd.gcd }}</strong><span>{{ gcd.gcd === 1 ? 'Числа взаимно просты' : 'Есть общий делитель больше 1' }}</span></div>
      <button class="library-reset" @click="step = 1">Пройти шаги заново</button>
    </template>
    <template v-else>
      <div class="lab-fields"><label class="lab-field">Искомая сумма: {{ sum }}<input v-model.number="sum" type="range" min="2" max="12" /></label><label class="lab-field">Условие<select v-model.number="firstDie"><option :value="0">Без условия</option><option v-for="n in 6" :key="n" :value="n">Первый кубик = {{ n }}</option></select></label></div>
      <div class="dice-grid" role="img" :aria-label="`${favorable} благоприятных исходов из ${outcomes.length}`"><span v-for="d in dice" :key="`${d.a}-${d.b}`" :class="{ excluded: firstDie && d.a !== firstDie, favorable: (!firstDie || d.a === firstDie) && d.a+d.b === sum }">{{ d.a }},{{ d.b }}</span></div>
      <p>Тёмные пары дают нужную сумму, зачёркнутые исключены условием. Пара (a,b) означает результаты первого и второго кубика.</p>
      <div class="numeric-result" aria-live="polite"><span>{{ firstDie ? 'Условная вероятность' : 'Вероятность' }} суммы {{ sum }}</span><strong>{{ favorable }} / {{ outcomes.length }}</strong><span>{{ (favorable/outcomes.length*100).toFixed(2) }}%</span></div>
    </template>
  </div>
</template>
