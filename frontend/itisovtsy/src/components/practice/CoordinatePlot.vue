<script setup lang="ts">
import { computed, useId } from 'vue'
import type { PlotLine } from '../../data/analysisMath'
const props = withDefaults(defineProps<{ xMin: number; xMax: number; yMin: number; yMax: number; lines?: PlotLine[]; description: string; xLabel?: string; yLabel?: string; equalUnits?: boolean }>(), { lines: () => [], xLabel: 'x', yLabel: 'y', equalUnits: false })
const clipId = `plot-${useId()}`
const scale = computed(() => Math.min(494/(props.xMax-props.xMin),264/(props.yMax-props.yMin)))
const plotWidth = computed(() => props.equalUnits ? scale.value*(props.xMax-props.xMin) : 494)
const plotHeight = computed(() => props.equalUnits ? scale.value*(props.yMax-props.yMin) : 264)
const left = computed(() => 48+(494-plotWidth.value)/2)
const top = computed(() => 18+(264-plotHeight.value)/2)
const sx = (x: number) => left.value+(x-props.xMin)/(props.xMax-props.xMin)*plotWidth.value
const sy = (y: number) => top.value+plotHeight.value-(y-props.yMin)/(props.yMax-props.yMin)*plotHeight.value
const xTicks = computed(() => Array.from({length: 5}, (_, i) => props.xMin+(props.xMax-props.xMin)*i/4))
const yTicks = computed(() => Array.from({length: 5}, (_, i) => props.yMin+(props.yMax-props.yMin)*i/4))
const tick = (v: number) => Number(v.toFixed(2)).toLocaleString('ru')
function path(line: PlotLine) {
  let open = false
  return line.points.map(point => {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) { open = false; return '' }
    const command = open ? 'L' : 'M'; open = true
    return `${command}${sx(point.x).toFixed(2)},${sy(point.y).toFixed(2)}`
  }).join(' ')
}
</script>
<template>
  <figure class="coordinate-figure">
    <svg viewBox="0 0 560 320" role="img" :aria-label="description" class="coordinate-plot">
      <defs><clipPath :id="clipId"><rect :x="left" :y="top" :width="plotWidth" :height="plotHeight" /></clipPath></defs>
      <rect :x="left" :y="top" :width="plotWidth" :height="plotHeight" fill="#fafbfd" stroke="#dce3ef" />
      <g stroke="#e3e8f0" stroke-width="1"><line v-for="x in xTicks" :key="`x${x}`" :x1="sx(x)" :x2="sx(x)" :y1="top" :y2="top+plotHeight" /><line v-for="y in yTicks" :key="`y${y}`" :x1="left" :x2="left+plotWidth" :y1="sy(y)" :y2="sy(y)" /></g>
      <g :clip-path="`url(#${clipId})`">
        <slot name="background" :sx="sx" :sy="sy" />
        <line v-if="yMin <= 0 && yMax >= 0" :x1="left" :x2="left+plotWidth" :y1="sy(0)" :y2="sy(0)" stroke="#8b9bb2" />
        <line v-if="xMin <= 0 && xMax >= 0" :x1="sx(0)" :x2="sx(0)" :y1="top" :y2="top+plotHeight" stroke="#8b9bb2" />
        <path v-for="(line, i) in lines" :key="i" :d="path(line)" fill="none" :stroke="line.color || '#234d83'" stroke-width="2.5" :stroke-dasharray="line.dashed ? '7 5' : undefined" />
        <slot :sx="sx" :sy="sy" />
      </g>
      <g fill="#63748d" font-size="10"><text v-for="x in xTicks" :key="`tx${x}`" :x="sx(x)" :y="top+plotHeight+18" text-anchor="middle">{{ tick(x) }}</text><text v-for="y in yTicks" :key="`ty${y}`" :x="left-8" :y="sy(y)+3" text-anchor="end">{{ tick(y) }}</text><text x="550" y="315" text-anchor="end">{{ xLabel }}</text><text x="14" y="12">{{ yLabel }}</text></g>
    </svg>
    <figcaption class="plot-legend"><span v-for="(line, i) in lines" :key="i"><i :style="{ borderColor: line.color || '#234d83', borderTopStyle: line.dashed ? 'dashed' : 'solid' }"></i>{{ line.label }}</span></figcaption>
  </figure>
</template>
