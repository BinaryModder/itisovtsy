<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import brushLettering from '../assets/itis-brush.svg?raw'

const canvas = ref<HTMLCanvasElement | null>(null)
let cleanup = () => {}

onMounted(() => {
  const element = canvas.value
  const context = element?.getContext('2d')
  if (!element || !context) return

  const letteringDocument = new DOMParser().parseFromString(brushLettering, 'image/svg+xml')
  const lettering = new Path2D(letteringDocument.querySelector('path')?.getAttribute('d') ?? '')

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const points = Array.from({ length: 1700 }, (_, index) => {
    const y = 1 - (index / 1699) * 2
    const radius = Math.sqrt(1 - y * y)
    const angle = index * Math.PI * (3 - Math.sqrt(5))
    return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius }
  })
  let width = 0
  let height = 0
  let frame = 0
  let rotation = 0.3
  let previousTime = 0
  let visible = true

  // Draw the lettering between the rear and front halves of the sphere.
  // Stacked faces give the rotating word depth without a WebGL dependency.
  function drawWord(radius: number) {
    if (!context) return
    const angle = (rotation - 0.3) * 1.25
    const turn = Math.cos(angle)
    const side = Math.sin(angle)
    const letteringScale = (radius * 1.55) / 540
    const thickness = radius * 0.035
    const layers = 18

    context.save()
    context.translate(width / 2, height / 2)
    context.rotate(-0.04)
    // Draw the far face first, then the near face, on either side of the turn.
    for (let layer = 0; layer <= layers; layer++) {
      const depth = (layer / layers - 0.5) * thickness * Math.sign(turn || 1)
      context.save()
      context.translate(side * depth, -depth * 0.22)
      context.transform(turn, side * 0.09, 0, 1, 0, 0)
      const shade = Math.round(30 + (layer / layers) * 24)
      context.fillStyle = layer === layers ? '#14254b' : `rgb(${shade}, ${shade + 16}, ${shade + 43})`
      context.scale(letteringScale, letteringScale)
      context.translate(-270, -150)
      context.fill(lettering, 'evenodd')
      context.restore()
    }
    context.restore()
  }

  function draw() {
    if (!context) return
    context.clearRect(0, 0, width, height)
    const radius = Math.min(width, height) * 0.42
    const cos = Math.cos(rotation)
    const sin = Math.sin(rotation)
    const projected = points.map((point) => {
      const x = point.x * cos - point.z * sin
      const z = point.x * sin + point.z * cos
      const tilt = -0.23
      return {
        x: x * Math.cos(tilt) - point.y * Math.sin(tilt),
        y: x * Math.sin(tilt) + point.y * Math.cos(tilt),
        z,
      }
    }).sort((a, b) => a.z - b.z)

    let wordDrawn = false
    for (const point of projected) {
      if (!wordDrawn && point.z >= 0) {
        drawWord(radius)
        wordDrawn = true
      }
      const perspective = 3.8 / (3.8 - point.z)
      const depth = (point.z + 1) / 2
      context.beginPath()
      context.arc(width / 2 + point.x * radius * perspective, height / 2 + point.y * radius * perspective, 0.65 + depth * 1.15, 0, Math.PI * 2)
      // Soften the foreground points near the lettering to keep it readable.
      const centerDistance = Math.hypot(point.x / 0.8, point.y / 0.48)
      const alpha = (0.1 + depth * 0.6) * (point.z > 0 && centerDistance < 1 ? 0.22 : 1)
      context.fillStyle = `rgba(20, 37, 75, ${alpha})`
      context.fill()
    }
  }

  function resize() {
    if (!element || !context) return
    const bounds = element.getBoundingClientRect()
    width = bounds.width
    height = bounds.height
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    element.width = Math.round(width * ratio)
    element.height = Math.round(height * ratio)
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    draw()
  }

  function tick(time: number) {
    if (previousTime) rotation += Math.min(time - previousTime, 50) * 0.00009
    previousTime = time
    draw()
    frame = requestAnimationFrame(tick)
  }

  function syncAnimation() {
    cancelAnimationFrame(frame)
    previousTime = 0
    if (!motion.matches && visible && !document.hidden) frame = requestAnimationFrame(tick)
    else draw()
  }

  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    syncAnimation()
  })
  resizeObserver.observe(element)
  intersectionObserver.observe(element)
  motion.addEventListener('change', syncAnimation)
  document.addEventListener('visibilitychange', syncAnimation)
  cleanup = () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    motion.removeEventListener('change', syncAnimation)
    document.removeEventListener('visibilitychange', syncAnimation)
  }
})
onUnmounted(() => cleanup())
</script>

<template>
  <canvas ref="canvas" class="community-sphere" aria-hidden="true"></canvas>
</template>
