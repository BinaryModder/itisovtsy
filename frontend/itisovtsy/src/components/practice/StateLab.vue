<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { parity } from '../../data/discreteMath'
defineProps<{ kind: 'automata' | 'codes' }>()
const word = ref('1011'), position = ref(0)
const valid = computed(() => /^[01]{0,16}$/.test(word.value))
const state = computed(() => parity([...word.value.slice(0, position.value)].map(Number)))
watch(word, () => { position.value = 0 })
const data = ref([1, 0, 1, 1])
const errors = ref<boolean[]>(Array(5).fill(false))
const sent = computed(() => [...data.value, parity(data.value)])
const received = computed(() => sent.value.map((bit, i) => bit ^ Number(errors.value[i])))
const flips = computed(() => errors.value.filter(Boolean).length)
</script>
<template>
  <div class="discrete-lab" v-if="kind === 'automata'">
    <label class="lab-field">Двоичное слово (до 16 символов)<input v-model="word" maxlength="16" :aria-invalid="!valid" aria-describedby="automaton-help" placeholder="Пустое слово ε" /></label><p id="automaton-help" :class="{ 'field-error': !valid }">{{ valid ? 'Читаем слева направо. Пустая строка — слово ε.' : 'Допустимы только символы 0 и 1.' }}</p>
    <svg viewBox="0 0 440 210" class="math-svg" role="img" :aria-label="`Текущее состояние: ${state ? 'нечётно' : 'чётно'}. При 1 переход в другое состояние, при 0 состояние не меняется.`"><defs><marker id="automaton-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#476cae" /></marker></defs><path d="M 162 78 Q 220 20 280 78 M 278 130 Q 220 190 160 130" fill="none" stroke="#476cae" stroke-width="2" marker-end="url(#automaton-arrow)" /><text x="215" y="44">1</text><text x="215" y="179">1</text><path d="M 98 62 C 40 -10 188 -10 144 62 M 298 62 C 240 -10 388 -10 344 62" fill="none" stroke="#476cae" stroke-width="2" marker-end="url(#automaton-arrow)" /><text x="114" y="16">0</text><text x="314" y="16">0</text><path d="M 20 105 L 66 105" stroke="#476cae" stroke-width="2" marker-end="url(#automaton-arrow)" /><circle cx="120" cy="105" r="48" :fill="state === 0 ? '#cadcf7' : '#f5f7fb'" stroke="#14254b" stroke-width="2" /><circle cx="120" cy="105" r="42" fill="none" stroke="#14254b" /><circle cx="320" cy="105" r="48" :fill="state === 1 ? '#cadcf7' : '#f5f7fb'" stroke="#14254b" stroke-width="2" /><text x="120" y="110" text-anchor="middle">Чётно</text><text x="320" y="110" text-anchor="middle">Нечётно</text></svg>
    <p>Двойная окружность — принимающее состояние; стрелка слева — старт.</p>
    <div class="word-tape" aria-label="Прочитанные символы"><span v-for="(bit, i) in word" :key="i" :class="{ consumed: i < position, current: i === position }">{{ bit }}</span><span v-if="!word">ε</span></div>
    <div class="lab-actions"><button class="button button-primary" :disabled="!valid || position === word.length" @click="position++">Прочитать символ →</button><button class="library-reset" @click="position = 0">Сначала</button></div>
    <p role="status" v-if="valid">Прочитано {{ position }} / {{ word.length }}. {{ position === word.length ? (state === 0 ? 'Слово принято: единиц чётное число.' : 'Слово отклонено: единиц нечётное число.') : 'Чтение ещё не закончено.' }}</p>
  </div>
  <div class="discrete-lab" v-else>
    <p>Сначала задай четыре информационных бита. Пятый, проверочный, вычисляется автоматически.</p>
    <div class="bit-row"><button v-for="(bit, i) in data" :key="i" :aria-label="`Информационный бит ${i+1}`" :aria-pressed="Boolean(bit)" @click="data[i] = 1-bit; errors = Array(5).fill(false)">{{ bit }}</button><span class="parity-bit" :aria-label="`Проверочный бит ${sent[4]}`">{{ sent[4] }}<small>p</small></span></div>
    <p>Отправлено: <strong>{{ sent.join('') }}</strong>. Теперь переключи ошибки в канале:</p>
    <div class="bit-row"><label v-for="(_, i) in errors" :key="i"><input v-model="errors[i]" type="checkbox" />Бит {{ i+1 }}</label></div>
    <div class="formula-output" aria-live="polite"><p>Получено: <strong>{{ received.join('') }}</strong></p><p>Расстояние Хэмминга: {{ flips }}. Сумма битов по модулю 2: {{ parity(received) }}.</p><p>{{ parity(received) ? 'Проверка обнаружила ошибку, но не знает её позицию.' : flips ? 'Проверка пройдена, хотя данные изменились: чётное число ошибок не обнаружено.' : 'Проверка пройдена. В этом опыте ошибок нет.' }}</p></div>
    <button class="library-reset" @click="errors = Array(5).fill(false)">Убрать ошибки</button>
  </div>
</template>
