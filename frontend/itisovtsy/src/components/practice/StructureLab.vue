<script setup lang="ts">
import { computed, ref } from 'vue'
import { graphProperties, relationProperties, type Edge } from '../../data/discreteMath'
const props = defineProps<{ kind: 'relations' | 'functions' | 'graphs' | 'trees' }>()
const matrix = ref<boolean[][]>(Array.from({ length: 3 }, (_, a) => Array.from({ length: 3 }, (_, b) => a === b)))
const properties = computed(() => relationProperties(matrix.value))
const propertyNames = { reflexive: 'Рефлексивность', symmetric: 'Симметричность', antisymmetric: 'Антисимметричность', transitive: 'Транзитивность', equivalence: 'Эквивалентность', order: 'Частичный порядок' }
function relationPreset(all: boolean) { matrix.value = Array.from({ length: 3 }, (_, a) => Array.from({ length: 3 }, (_, b) => all || a === b)) }
const targetSize = ref(3)
const mapping = ref([0, 1, 2])
const letters = ['a', 'b', 'c', 'd']
const image = computed(() => new Set(mapping.value))
function resize(size: number) { targetSize.value = size; mapping.value = mapping.value.map(n => Math.min(n, size - 1)) }
const edges = ref<Edge[]>(props.kind === 'trees' ? [[0, 1], [1, 2], [1, 3], [3, 4]] : [[0, 1], [1, 2], [2, 0], [3, 4]])
const points = Array.from({ length: 5 }, (_, i) => ({ x: 220 + Math.cos(i * 2 * Math.PI / 5 - Math.PI / 2) * 115, y: 150 + Math.sin(i * 2 * Math.PI / 5 - Math.PI / 2) * 115 }))
const pairs: Edge[] = []
for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) pairs.push([a, b])
const graph = computed(() => graphProperties(5, edges.value))
const hasEdge = (a: number, b: number) => edges.value.some(([x, y]) => x === a && y === b || x === b && y === a)
function toggleEdge(a: number, b: number) { if (hasEdge(a, b)) edges.value = edges.value.filter(([x, y]) => !(x === a && y === b || x === b && y === a)); else edges.value.push([a, b]) }
const chosenVertex = ref<number | null>(null)
function connect(vertex: number) {
  if (chosenVertex.value === null) chosenVertex.value = vertex
  else { if (chosenVertex.value !== vertex) toggleEdge(chosenVertex.value, vertex); chosenVertex.value = null }
}
</script>
<template>
  <div v-if="kind === 'relations'" class="discrete-lab">
    <p>Отношение на A = {1, 2, 3}. Нажми клетку, чтобы добавить или убрать пару (строка, столбец).</p>
    <table class="math-table relation-matrix"><caption>Матрица отношения R</caption><thead><tr><th scope="col">aRb</th><th v-for="n in 3" :key="n" scope="col">{{ n }}</th></tr></thead><tbody><tr v-for="(row, a) in matrix" :key="a"><th scope="row">{{ a + 1 }}</th><td v-for="(value, b) in row" :key="b"><button :aria-label="`Пара (${a + 1}, ${b + 1})`" :aria-pressed="value" @click="matrix[a]![b] = !value">{{ Number(value) }}</button></td></tr></tbody></table>
    <div class="lab-actions"><button class="library-reset" @click="relationPreset(false)">Только равенство</button><button class="library-reset" @click="relationPreset(true)">Все пары</button></div>
    <div class="property-grid" aria-live="polite"><div v-for="(label, key) in propertyNames" :key="key" :class="{ satisfied: properties[key] }"><span>{{ properties[key] ? '✓' : '—' }}</span> {{ label }}</div></div>
  </div>
  <div v-else-if="kind === 'functions'" class="discrete-lab">
    <label class="lab-field">Размер множества B<select :value="targetSize" @change="resize(Number(($event.target as HTMLSelectElement).value))"><option v-for="n in [2,3,4]" :key="n" :value="n">{{ n }}</option></select></label>
    <svg viewBox="0 0 440 300" class="math-svg" role="img" aria-label="Отображение из A = {1, 2, 3} в B. Направления также заданы в списках ниже."><defs><marker id="mapping-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#476cae" /></marker></defs><text x="75" y="24">A</text><text x="350" y="24">B</text><line v-for="(target, i) in mapping" :key="i" x1="105" :y1="60 + i * 80" x2="324" :y2="55 + target * 65" stroke="#476cae" stroke-width="2" marker-end="url(#mapping-arrow)" /><g v-for="n in 3" :key="n"><circle cx="80" :cy="60 + (n-1)*80" r="22" fill="#e3ecf8" /><text x="80" :y="65+(n-1)*80" text-anchor="middle">{{ n }}</text></g><g v-for="n in targetSize" :key="n"><circle cx="350" :cy="55+(n-1)*65" r="22" :fill="image.has(n-1) ? '#cadcf7' : '#f1f4f8'" /><text x="350" :y="60+(n-1)*65" text-anchor="middle">{{ letters[n-1] }}</text></g></svg>
    <div class="lab-fields"><label v-for="(_, i) in mapping" :key="i" class="lab-field">f({{ i + 1 }})<select v-model.number="mapping[i]"><option v-for="n in targetSize" :key="n" :value="n-1">{{ letters[n-1] }}</option></select></label></div>
    <div class="property-grid" aria-live="polite"><div :class="{ satisfied: image.size === 3 }">{{ image.size === 3 ? '✓' : '—' }} Инъекция</div><div :class="{ satisfied: image.size === targetSize }">{{ image.size === targetSize ? '✓' : '—' }} Сюръекция</div><div :class="{ satisfied: image.size === 3 && image.size === targetSize }">{{ image.size === 3 && image.size === targetSize ? '✓' : '—' }} Биекция</div></div>
    <p>Образ A: { {{ [...image].sort().map(n => letters[n]).join(', ') }} }</p>
  </div>
  <div v-else class="discrete-lab">
    <p>Выбери две вершины, чтобы переключить ребро, или воспользуйся кнопками под графом.</p>
    <svg viewBox="0 0 440 300" class="math-svg graph-editor" role="group" aria-label="Граф на пяти вершинах"><line v-for="([a,b], i) in edges" :key="i" :x1="points[a]!.x" :y1="points[a]!.y" :x2="points[b]!.x" :y2="points[b]!.y" stroke="#7390b7" stroke-width="3" /><g v-for="(point, i) in points" :key="i" role="button" tabindex="0" :aria-label="`Вершина ${i+1}, степень ${graph.degrees[i]}`" :aria-pressed="chosenVertex === i" @click="connect(i)" @keydown.enter.prevent="connect(i)" @keydown.space.prevent="connect(i)"><circle :cx="point.x" :cy="point.y" r="23" :fill="chosenVertex === i ? '#14254b' : '#e3ecf8'" stroke="#476cae" stroke-width="2" /><text :x="point.x" :y="point.y+5" text-anchor="middle" :fill="chosenVertex === i ? 'white' : '#14254b'">{{ i+1 }}</text></g></svg>
    <p role="status">{{ chosenVertex === null ? 'Выбери первую вершину.' : `Выбрана вершина ${chosenVertex + 1}. Выбери вторую; повторное нажатие отменяет выбор.` }}</p>
    <div class="edge-buttons" aria-label="Рёбра графа"><button v-for="[a,b] in pairs" :key="`${a}-${b}`" :aria-pressed="hasEdge(a,b)" @click="toggleEdge(a,b)">{{ a+1 }}—{{ b+1 }}</button></div>
    <div class="lab-actions"><button class="library-reset" @click="edges = []; chosenVertex = null">Убрать все рёбра</button><button class="library-reset" @click="edges = [[0,1],[1,2],[2,3],[3,4]]; chosenVertex = null">Построить путь</button></div>
    <div class="graph-results" aria-live="polite"><p>Рёбер: <strong>{{ edges.length }}</strong> · Компонент: <strong>{{ graph.components }}</strong></p><p>Степени вершин: {{ graph.degrees.join(', ') }}<br />Σ deg(v) = {{ graph.degrees.reduce((a,b) => a+b,0) }} = 2 × {{ edges.length }}</p><div class="property-grid"><div :class="{ satisfied: graph.components === 1 }">{{ graph.components === 1 ? '✓ Связный' : '— Несвязный' }}</div><div :class="{ satisfied: graph.bipartite }">{{ graph.bipartite ? '✓ Двудольный' : '— Не двудольный' }}</div><div :class="{ satisfied: graph.tree }">{{ graph.tree ? '✓ Дерево' : '— Не дерево' }}</div><div>{{ graph.cycle ? 'Есть цикл' : 'Нет циклов' }}</div></div><p>{{ kind === 'trees' ? (graph.tree ? 'Между каждой парой вершин ровно один простой путь.' : 'Для дерева нужны связность и отсутствие циклов.') : graph.euler }}</p></div>
  </div>
</template>
