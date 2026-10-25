<script setup lang="ts">
import { computed, ref } from 'vue'
import { normalForms } from '../../data/discreteMath'
defineProps<{ kind: 'logic' | 'boolean' }>()
const rows = [[false, false], [false, true], [true, false], [true, true]] as const
const chosen = ref(2)
const operation = ref('implication')
const values = ref([false, true, true, false])
const forms = computed(() => normalForms(values.value))
const operations: Record<string, { label: string; evaluate: (p: boolean, q: boolean) => boolean }> = {
  and: { label: 'p ∧ q', evaluate: (p, q) => p && q }, or: { label: 'p ∨ q', evaluate: (p, q) => p || q },
  implication: { label: 'p → q', evaluate: (p, q) => !p || q }, equivalent: { label: 'p ↔ q', evaluate: (p, q) => p === q }, xor: { label: 'p ⊕ q', evaluate: (p, q) => p !== q },
}
const selected = computed(() => operations[operation.value]!)
</script>
<template>
  <div class="discrete-lab">
    <template v-if="kind === 'logic'">
      <label class="lab-field">Операция<select v-model="operation"><option v-for="(op, key) in operations" :key="key" :value="key">{{ op.label }}</option></select></label>
      <table class="math-table"><caption>Все четыре набора значений</caption><thead><tr><th scope="col">p</th><th scope="col">q</th><th scope="col">{{ selected.label }}</th><th scope="col">Исследовать</th></tr></thead><tbody><tr v-for="([p,q], i) in rows" :key="i" :class="{ 'active-row': chosen === i }"><td>{{ Number(p) }}</td><td>{{ Number(q) }}</td><td><strong>{{ Number(selected.evaluate(p,q)) }}</strong></td><td><button :aria-label="`Выбрать p=${Number(p)}, q=${Number(q)}`" :aria-pressed="chosen === i" @click="chosen = i">{{ chosen === i ? 'Выбрано' : 'Выбрать' }}</button></td></tr></tbody></table>
      <div class="logic-flow" aria-live="polite"><span>p = {{ Number(rows[chosen]![0]) }}<br />q = {{ Number(rows[chosen]![1]) }}</span><span aria-hidden="true">→</span><strong>{{ selected.label }}</strong><span aria-hidden="true">→</span><span class="logic-output">{{ Number(selected.evaluate(rows[chosen]![0], rows[chosen]![1])) }}</span></div>
      <p>1 — истина, 0 — ложь. Строка показывает результат только для выбранного набора; таблица задаёт функцию целиком.</p>
    </template>
    <template v-else>
      <p>Переключай выход каждой строки. СДНФ и СКНФ построятся по твоей таблице.</p>
      <table class="math-table"><caption>Булева функция от двух переменных</caption><thead><tr><th scope="col">p</th><th scope="col">q</th><th scope="col">f(p,q)</th></tr></thead><tbody><tr v-for="([p,q], i) in rows" :key="i"><td>{{ Number(p) }}</td><td>{{ Number(q) }}</td><td><button :aria-label="`Значение функции для ${Number(p)}${Number(q)}`" :aria-pressed="values[i]" @click="values[i] = !values[i]">{{ Number(values[i]) }}</button></td></tr></tbody></table>
      <div class="lab-actions"><button class="library-reset" @click="values = [false,true,true,false]">XOR</button><button class="library-reset" @click="values = [false,false,false,true]">AND</button><button class="library-reset" @click="values = [true,true,true,false]">NAND</button></div>
      <div class="formula-output" aria-live="polite"><span>СДНФ</span><p>{{ forms.dnf }}</p><span>СКНФ</span><p>{{ forms.cnf }}</p></div>
    </template>
  </div>
</template>
