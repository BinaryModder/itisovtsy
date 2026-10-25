<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AnalysisKind } from '../../data/analysis'
import { derivativeValue, epsilonIndex, exponentialErrorBound, exponentialTaylor, functionValue, geometricPartial, gradientAt, powerIntegral, rectangleIntegral, riemannSum, sampleCurve, secantSlope, sequenceValue, type FunctionKind, type PlotLine } from '../../data/analysisMath'
import CoordinatePlot from './CoordinatePlot.vue'
const props = defineProps<{ kind: AnalysisKind }>()
const fmt = (n: number) => Math.abs(n) < .0000005 ? '0' : n.toLocaleString('ru', { maximumFractionDigits: 6 })
const sequenceKind = ref<'inverse' | 'alternating' | 'oscillating'>('inverse'), epsilon = ref(.2)
const sequencePoints = computed(() => Array.from({length: 60}, (_, i) => ({ x: i+1, y: sequenceValue(sequenceKind.value, i+1) })))
const limitKind = ref('rational'), distance = ref(.5)
const limitAt = computed(() => limitKind.value === 'rational' ? 1 : 0)
const limitValue = computed(() => limitKind.value === 'rational' ? 2 : 1)
const nearValue = (x: number) => limitKind.value === 'rational' ? x+1 : Math.sin(x)/x
const limitLines = computed<PlotLine[]>(() => [{ label: limitKind.value === 'rational' ? '(x²−1)/(x−1), x≠1' : 'sin(x)/x, x≠0', points: sampleCurve(x => limitKind.value === 'rational' ? x+1 : x === 0 ? 1 : Math.sin(x)/x, -1, 3) }])
const pointValue = ref(2)
const derivativeKind = ref<FunctionKind>('square'), at = ref(1), hMagnitude = ref(.5), side = ref(1)
const h = computed(() => hMagnitude.value*side.value)
const slope = computed(() => secantSlope(derivativeKind.value, at.value, h.value))
const derivative = computed(() => derivativeValue(derivativeKind.value, at.value))
const derivativeLines = computed<PlotLine[]>(() => [
  { label: derivativeKind.value === 'square' ? 'f(x)=x²' : derivativeKind.value === 'cube' ? 'f(x)=x³' : 'f(x)=sin x', points: sampleCurve(x => functionValue(derivativeKind.value, x), -2.4, 2.4) },
  { label: 'Секущая', color: '#ac651a', dashed: true, points: sampleCurve(x => functionValue(derivativeKind.value, at.value)+slope.value*(x-at.value), -2.4, 2.4, 2) },
  { label: 'Касательная', color: '#27785a', points: sampleCurve(x => functionValue(derivativeKind.value, at.value)+derivative.value*(x-at.value), -2.4, 2.4, 2) },
])
const parameter = ref(1), showDerivative = ref(false)
const critical = computed(() => Math.sqrt(parameter.value))
const cubic = (x: number) => x**3-3*parameter.value*x
const extremaLines = computed<PlotLine[]>(() => [
  { label: 'f(x)=x³−3ax', points: sampleCurve(cubic, -2.3, 2.3) },
  ...(showDerivative.value ? [{label: 'f′(x)=3x²−3a', color: '#ac651a', dashed: true, points: sampleCurve(x => 3*x*x-3*parameter.value, -2.3, 2.3)}] : []),
])
const constant = ref(0)
const primitiveLines = computed<PlotLine[]>(() => [{ label: `F(x)=x³/3 + (${fmt(constant.value)})`, points: sampleCurve(x => x**3/3+constant.value, -2, 2) }, { label: 'F′(x)=x²', color: '#ac651a', dashed: true, points: sampleCurve(x => x*x, -2, 2) }])
const integralKind = ref<FunctionKind>('square'), upper = ref(1), rectangles = ref(8), method = ref<'start' | 'middle' | 'end'>('middle')
const integral = computed(() => riemannSum(integralKind.value, 0, upper.value, rectangles.value, method.value))
const integralLines = computed<PlotLine[]>(() => [{ label: integralKind.value === 'square' ? 'f(x)=x²' : integralKind.value === 'linear' ? 'f(x)=x' : 'f(x)=sin x', points: sampleCurve(x => functionValue(integralKind.value,x), -2.2, 2.2) }])
const power = ref(2), boundary = ref(5)
const improperLines = computed<PlotLine[]>(() => [{label: `f(x)=x^(−${fmt(power.value)})`, points: sampleCurve(x => x**(-power.value), 1, 20)}])
const improperArea = computed(() => [{x:1,y:0}, ...sampleCurve(x => x**(-power.value), 1, boundary.value, 120), {x:boundary.value,y:0}])
const quotient = ref(.5), terms = ref(12)
const partials = computed(() => Array.from({length: terms.value}, (_, i) => ({ x: i+1, y: geometricPartial(quotient.value, i+1) })))
const seriesRange = computed(() => { const values = [0, ...partials.value.map(p => p.y), ...(Math.abs(quotient.value)<1 ? [1/(1-quotient.value)] : [])]; return { min: Math.min(...values)-.5, max: Math.max(...values)+.5 } })
const seriesLines = computed<PlotLine[]>(() => Math.abs(quotient.value)<1 ? [{label: 'Сумма бесконечного ряда', color:'#27785a', dashed:true, points: [{x:0,y:1/(1-quotient.value)},{x:40,y:1/(1-quotient.value)}]}] : [])
const degree = ref(3), evaluation = ref(1)
const taylorLines = computed<PlotLine[]>(() => [{label:'eˣ', points: sampleCurve(Math.exp,-2,2)},{label:`T${degree.value}(x)`, color:'#ac651a', dashed:true, points:sampleCurve(x => exponentialTaylor(x,degree.value),-2,2)}])
const px = ref(1), py = ref(1), angle = ref(0)
const gradient = computed(() => gradientAt(px.value,py.value))
const radians = computed(() => angle.value*Math.PI/180)
const directionValue = computed(() => gradient.value.x*Math.cos(radians.value)+gradient.value.y*Math.sin(radians.value))
const levels = [1,2,4,6,8]
const levelLines = computed<PlotLine[]>(() => levels.map(level => ({ label:`f=${level}`, color:'#b1c4df', points:Array.from({length:101}, (_, i) => ({x:Math.sqrt(level)*Math.cos(i*Math.PI/50),y:Math.sqrt(level)*Math.sin(i*Math.PI/50)})) })))
const width = ref(1), height = ref(1)
const volume = computed(() => rectangleIntegral(width.value,height.value))
const tiles = computed(() => Array.from({length:64}, (_, i) => {
  const x = i%8*width.value/8, y = Math.floor(i/8)*height.value/8
  return {x,y,value:x+width.value/16+y+height.value/16}
}))
</script>
<template>
  <div class="discrete-lab analysis-lab">
    <template v-if="kind === 'sequences'">
      <div class="lab-fields"><label class="lab-field">Последовательность<select v-model="sequenceKind"><option value="inverse">aₙ=1/n</option><option value="alternating">aₙ=(−1)ⁿ/n</option><option value="oscillating">aₙ=(−1)ⁿ</option></select></label><label class="lab-field">ε = {{ fmt(epsilon) }}<input v-model.number="epsilon" type="range" min="0.025" max="0.5" step="0.025" /></label></div>
      <CoordinatePlot :x-min="0" :x-max="60" :y-min="-1.2" :y-max="1.2" x-label="n" y-label="aₙ" :description="`Первые 60 членов. Проверяем приближение к 0 с точностью ${epsilon}.`"><template #background="{sx,sy}"><rect :x="sx(0)" :y="sy(epsilon)" :width="sx(60)-sx(0)" :height="sy(-epsilon)-sy(epsilon)" fill="#dceee5" /></template><template #default="{sx,sy}"><circle v-for="point in sequencePoints" :key="point.x" :cx="sx(point.x)" :cy="sy(point.y)" r="3" :fill="Math.abs(point.y)<epsilon ? '#27785a' : '#234d83'" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>Зелёная полоса: −{{ fmt(epsilon) }} &lt; aₙ &lt; {{ fmt(epsilon) }}.</p><p v-if="sequenceKind !== 'oscillating'">Можно взять N={{ epsilonIndex(epsilon) }}: при n>N имеем |aₙ|=1/n&lt;ε. Предел равен 0.</p><p v-else>Ни одна точка не попадает в полосу. Подпоследовательности равны 1 и −1, поэтому общего предела нет.</p></div>
    </template>
    <template v-else-if="kind === 'limits'">
      <div class="lab-fields"><label class="lab-field">Функция<select v-model="limitKind"><option value="rational">(x²−1)/(x−1), x→1</option><option value="sinc">sin(x)/x, x→0</option></select></label><label class="lab-field">Расстояние h = {{ fmt(distance) }}<input v-model.number="distance" type="range" min="0.01" max="0.9" step="0.01" /></label></div>
      <CoordinatePlot :x-min="-1" :x-max="3" :y-min="-0.5" :y-max="4.5" :lines="limitLines" description="Две точки приближаются к исключённому аргументу с разных сторон."><template #default="{sx,sy}"><circle :cx="sx(limitAt)" :cy="sy(limitValue)" r="6" fill="white" stroke="#234d83" stroke-width="2" /><circle v-for="sign in [-1,1]" :key="sign" :cx="sx(limitAt+sign*distance)" :cy="sy(nearValue(limitAt+sign*distance))" r="5" fill="#ac651a" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>Слева: x={{ fmt(limitAt-distance) }}, f(x)≈{{ fmt(nearValue(limitAt-distance)) }}.</p><p>Справа: x={{ fmt(limitAt+distance) }}, f(x)≈{{ fmt(nearValue(limitAt+distance)) }}.</p><p>Точный предел: {{ limitValue }}. Пустой кружок обозначает исключённую точку. Численные значения иллюстрируют предел, но не заменяют доказательство.</p></div>
    </template>
    <template v-else-if="kind === 'continuity'">
      <label class="lab-field">Значение в точке: f(0) = {{ fmt(pointValue) }}<input v-model.number="pointValue" type="range" min="-1" max="3" step="0.1" /></label>
      <CoordinatePlot :x-min="-2" :x-max="2" :y-min="-1.5" :y-max="3.5" :lines="[{label:'f(x)=x+1 при x≠0', points:sampleCurve(x=>x+1,-2,2)}]" description="График x+1 с отдельно заданным значением в нуле."><template #default="{sx,sy}"><circle :cx="sx(0)" :cy="sy(1)" r="6" fill="white" stroke="#234d83" stroke-width="2" /><circle :cx="sx(0)" :cy="sy(pointValue)" r="5" fill="#ac651a" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>Предел при x→0 равен 1, значение f(0)={{ fmt(pointValue) }}.</p><p>{{ pointValue === 1 ? 'Функция непрерывна: значение и предел совпали.' : 'Устранимый разрыв: чтобы его убрать, установи f(0)=1.' }}</p></div><button class="library-reset" @click="pointValue = 1">Доопределить непрерывно</button>
    </template>
    <template v-else-if="kind === 'derivatives'">
      <label class="lab-field">Функция<select v-model="derivativeKind"><option value="square">x²</option><option value="cube">x³</option><option value="sin">sin x</option></select></label>
      <div class="lab-fields"><label class="lab-field">Точка a={{ fmt(at) }}<input v-model.number="at" type="range" min="-1" max="1" step="0.1" /></label><label class="lab-field">|h|={{ fmt(hMagnitude) }}<input v-model.number="hMagnitude" type="range" min="0.02" max="1" step="0.02" /></label><label class="lab-field">Сторона<select v-model.number="side"><option :value="1">Справа, h>0</option><option :value="-1">Слева, h&lt;0</option></select></label></div>
      <CoordinatePlot :x-min="-2.4" :x-max="2.4" :y-min="derivativeKind === 'cube' ? -9 : -2" :y-max="derivativeKind === 'cube' ? 9 : 6" :lines="derivativeLines" description="Секущая через две точки графика и касательная в точке a."><template #default="{sx,sy}"><circle v-for="x in [at,at+h]" :key="x" :cx="sx(x)" :cy="sy(functionValue(derivativeKind,x))" r="5" fill="#ac651a" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>Наклон секущей ≈ {{ fmt(slope) }}. По формуле f′(a)≈{{ fmt(derivative) }}.</p><p>Разность наклонов по модулю ≈ {{ fmt(Math.abs(slope-derivative)) }}.</p></div>
    </template>
    <template v-else-if="kind === 'extrema'">
      <label class="lab-field">Параметр a={{ fmt(parameter) }}<input v-model.number="parameter" type="range" min="0.25" max="2" step="0.05" /></label><div class="lab-toggles"><label><input v-model="showDerivative" type="checkbox" /> Показать график производной</label></div>
      <CoordinatePlot :x-min="-2.3" :x-max="2.3" :y-min="-6" :y-max="6" :lines="extremaLines" description="Кубическая функция с локальным максимумом и минимумом."><template #default="{sx,sy}"><circle v-for="x in [-critical,critical]" :key="x" :cx="sx(x)" :cy="sy(cubic(x))" r="5" fill="#ac651a" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>Локальный максимум при x=−√a≈{{ fmt(-critical) }}, минимум при x=√a≈{{ fmt(critical) }}.</p><p>Функция убывает на (−√a,√a) и возрастает на (−∞,−√a) и (√a,+∞). Перегиб — в x=0.</p></div>
    </template>
    <template v-else-if="kind === 'primitives'">
      <label class="lab-field">Константа C={{ fmt(constant) }}<input v-model.number="constant" type="range" min="-2" max="2" step="0.1" /></label>
      <CoordinatePlot :x-min="-2" :x-max="2" :y-min="-5" :y-max="5" :lines="primitiveLines" description="Вертикальный сдвиг первообразной не меняет её производную." />
      <div class="formula-output" aria-live="polite"><p>F(x)=x³/3+({{ fmt(constant) }}); F′(x)=x².</p><p>При изменении C график первообразной сдвигается по вертикали. Наклон в каждой точке сохраняется.</p></div>
    </template>
    <template v-else-if="kind === 'integrals'">
      <div class="lab-fields"><label class="lab-field">Подынтегральная функция<select v-model="integralKind"><option value="square">x²</option><option value="linear">x</option><option value="sin">sin x</option></select></label><label class="lab-field">Точка в каждом шаге<select v-model="method"><option value="start">Начало</option><option value="middle">Середина</option><option value="end">Конец</option></select></label></div>
      <div class="lab-fields"><label class="lab-field">Верхний предел b={{ fmt(upper) }}<input v-model.number="upper" type="range" min="-2" max="2" step="0.1" /></label><label class="lab-field">Прямоугольников: {{ rectangles }}<input v-model.number="rectangles" type="range" min="2" max="60" /></label></div>
      <CoordinatePlot :x-min="-2.2" :x-max="2.2" :y-min="-2.5" :y-max="5" :lines="integralLines" description="Прямоугольники суммы Римана на промежутке от нуля до b."><template #background="{sx,sy}"><rect v-for="(rect,i) in integral.rectangles" :key="i" :x="sx(Math.min(rect.x,rect.x+rect.dx))" :y="sy(Math.max(0,rect.y))" :width="Math.abs(sx(rect.x+rect.dx)-sx(rect.x))" :height="Math.abs(sy(rect.y)-sy(0))" :fill="rect.y >= 0 ? '#c9dfd4' : '#f0d9bb'" stroke="#8ba795" stroke-width="0.6" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>По первообразной: ∫₀ᵇ f(x)dx ≈ {{ fmt(integral.exact) }} (округлено). Сумма ≈ {{ fmt(integral.sum) }}.</p><p>Абсолютная ошибка ≈ {{ fmt(Math.abs(integral.sum-integral.exact)) }}.</p><p>{{ upper < 0 ? 'Движемся от 0 влево: Δx отрицательно. Поэтому знак суммы противоположен интегралу от b до 0.' : upper === 0 ? 'Границы совпали: интеграл и сумма равны 0.' : 'Δx положительно. Части ниже оси дают отрицательный вклад.' }} На рисунке зелёные прямоугольники выше оси, оранжевые — ниже.</p></div>
    </template>
    <template v-else-if="kind === 'improper'">
      <div class="lab-fields"><label class="lab-field">Показатель p={{ fmt(power) }}<input v-model.number="power" type="range" min="0.5" max="3" step="0.1" /></label><label class="lab-field">Верхняя граница b={{ boundary }}<input v-model.number="boundary" type="range" min="1" max="20" /></label></div>
      <CoordinatePlot :x-min="1" :x-max="20" :y-min="0" :y-max="1.2" :lines="improperLines" description="Накопление площади под x в степени минус p от 1 до b."><template #background="{sx,sy}"><polygon :points="improperArea.map(p=>`${sx(p.x)},${sy(p.y)}`).join(' ')" fill="#dceee5" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>∫₁ᵇ x⁻ᵖ dx ≈ {{ fmt(powerIntegral(power,boundary)) }}.</p><p v-if="power > 1">При b→∞ интеграл сходится к 1/(p−1)≈{{ fmt(1/(power-1)) }}. Неучтённый хвост ≈ {{ fmt(1/(power-1)-powerIntegral(power,boundary)) }}.</p><p v-else>При b→∞ интеграл расходится к +∞. {{ power === 1 ? 'Рост логарифмический: ln b.' : 'Рост степенной: (b^(1−p)−1)/(1−p).' }}</p></div>
    </template>
    <template v-else-if="kind === 'series'">
      <div class="lab-fields"><label class="lab-field">Знаменатель q={{ fmt(quotient) }}<input v-model.number="quotient" type="range" min="-1.1" max="1.1" step="0.1" /></label><label class="lab-field">Членов N={{ terms }}<input v-model.number="terms" type="range" min="1" max="40" /></label></div>
      <CoordinatePlot :x-min="0" :x-max="40" :y-min="seriesRange.min" :y-max="seriesRange.max" :lines="seriesLines" x-label="N" y-label="Sₙ" description="Отдельные точки — частичные суммы геометрического ряда. Вертикальный масштаб подстраивается под значения."><template #default="{sx,sy}"><circle v-for="p in partials" :key="p.x" :cx="sx(p.x)" :cy="sy(p.y)" r="3.5" fill="#234d83" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>S{{ terms }}=Σₖ₌₀ᴺ⁻¹ qᵏ≈{{ fmt(geometricPartial(quotient,terms)) }}.</p><p v-if="Math.abs(quotient)<1">|q|&lt;1: сумма ряда 1/(1−q)≈{{ fmt(1/(1-quotient)) }}. Ошибка частичной суммы ≈ {{ fmt(Math.abs(1/(1-quotient)-geometricPartial(quotient,terms))) }}.</p><p v-else>|q|≥1: ряд расходится. Конечная частичная сумма всё равно определена.</p><p>Вертикальный масштаб графика автоматически меняется.</p></div>
    </template>
    <template v-else-if="kind === 'taylor'">
      <div class="lab-fields"><label class="lab-field">Степень n={{ degree }}<input v-model.number="degree" type="range" min="0" max="10" /></label><label class="lab-field">Точка проверки x={{ fmt(evaluation) }}<input v-model.number="evaluation" type="range" min="-2" max="2" step="0.1" /></label></div>
      <CoordinatePlot :x-min="-2" :x-max="2" :y-min="-1.2" :y-max="8" :lines="taylorLines" description="Экспонента и её многочлен Маклорена выбранной степени."><template #default="{sx,sy}"><line :x1="sx(evaluation)" :x2="sx(evaluation)" :y1="sy(Math.exp(evaluation))" :y2="sy(exponentialTaylor(evaluation,degree))" stroke="#ac651a" stroke-width="4" /><circle :cx="sx(evaluation)" :cy="sy(Math.exp(evaluation))" r="4" fill="#234d83" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>eˣ≈{{ fmt(Math.exp(evaluation)) }}, Tₙ(x)≈{{ fmt(exponentialTaylor(evaluation,degree)) }}.</p><p>Ошибка ≈ {{ fmt(Math.abs(Math.exp(evaluation)-exponentialTaylor(evaluation,degree))) }}; оценка сверху по Лагранжу ≈ {{ fmt(exponentialErrorBound(evaluation,degree)) }}.</p></div>
    </template>
    <template v-else-if="kind === 'gradient'">
      <div class="lab-fields"><label class="lab-field">x={{ fmt(px) }}<input v-model.number="px" type="range" min="-1.5" max="1.5" step="0.1" /></label><label class="lab-field">y={{ fmt(py) }}<input v-model.number="py" type="range" min="-1.5" max="1.5" step="0.1" /></label><label class="lab-field">Направление θ={{ angle }}°<input v-model.number="angle" type="range" min="0" max="360" step="5" /></label></div>
      <CoordinatePlot equal-units :x-min="-3" :x-max="3" :y-min="-3" :y-max="3" :lines="levelLines" description="Линии уровня x²+y² и направление градиента из выбранной точки."><template #default="{sx,sy}"><line :x1="sx(px)" :y1="sy(py)" :x2="sx(px+gradient.x*0.35)" :y2="sy(py+gradient.y*0.35)" stroke="#27785a" stroke-width="3" /><circle :cx="sx(px+gradient.x*0.35)" :cy="sy(py+gradient.y*0.35)" r="4" fill="#27785a" /><line :x1="sx(px)" :y1="sy(py)" :x2="sx(px+Math.cos(radians))" :y2="sy(py+Math.sin(radians))" stroke="#ac651a" stroke-width="2" stroke-dasharray="5 4" /><circle :cx="sx(px)" :cy="sy(py)" r="5" fill="#14254b" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>f(x,y)={{ fmt(gradient.value) }}; ∇f=({{ fmt(gradient.x) }}, {{ fmt(gradient.y) }}), |∇f|≈{{ fmt(gradient.norm) }}.</p><p>Dᵤf=∇f·(cosθ,sinθ)≈{{ fmt(directionValue) }}.</p><p>Зелёный отрезок от тёмной точки к зелёной — градиент в масштабе 0,35. Оранжевый пунктир — единичное направление u. {{ gradient.norm === 0 ? 'В начале координат градиент нулевой: все производные по направлению равны 0.' : '' }}</p></div>
    </template>
    <template v-else-if="kind === 'double-integrals'">
      <div class="lab-fields"><label class="lab-field">Ширина a={{ fmt(width) }}<input v-model.number="width" type="range" min="0.25" max="3" step="0.25" /></label><label class="lab-field">Высота b={{ fmt(height) }}<input v-model.number="height" type="range" min="0.25" max="3" step="0.25" /></label></div>
      <CoordinatePlot equal-units :x-min="0" :x-max="3" :y-min="0" :y-max="3" description="Прямоугольная область интегрирования. Чем темнее ячейка, тем больше высота поверхности z=x+y."><template #background="{sx,sy}"><rect v-for="(tile,i) in tiles" :key="i" :x="sx(tile.x)" :y="sy(tile.y+height/8)" :width="sx(width/8)-sx(0)" :height="sy(0)-sy(height/8)" :fill="`hsl(215 45% ${94-tile.value*9}%)`" stroke="white" stroke-width="0.5" /></template></CoordinatePlot>
      <div class="formula-output" aria-live="polite"><p>D=[0,{{ fmt(width) }}]×[0,{{ fmt(height) }}], z=x+y. Цвет показывает высоту в центре ячейки.</p><p>Площадь D=ab={{ fmt(width*height) }}. Точный интеграл a²b/2+ab²/2={{ fmt(volume) }}.</p><p>Средняя высота (a+b)/2={{ fmt((width+height)/2) }}. Объём = площадь основания × средняя высота.</p></div>
    </template>
  </div>
</template>
