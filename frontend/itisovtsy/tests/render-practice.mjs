// Server rendering smoke check: no browser or listening port required.
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
const server = await createServer({ configFile: false, plugins: [vue()], server: { middlewareMode: true, hmr: false, ws: false, watch: null } })
try {
  const { default: Lesson } = await server.ssrLoadModule('/src/components/practice/TopicLesson.vue')
  const { default: Sets } = await server.ssrLoadModule('/src/components/practice/SetLesson.vue')
  const { default: Catalog } = await server.ssrLoadModule('/src/views/PracticeView.vue')
  const { discreteTopics } = await server.ssrLoadModule('/src/data/discrete.ts')
  const { analysisTopics } = await server.ssrLoadModule('/src/data/analysis.ts')
  const warnings = []
  async function render(component, props = {}) {
    const app = createSSRApp(component, props)
    app.config.warnHandler = message => warnings.push(message)
    app.component('RouterLink', { setup: (_, { slots }) => () => h('a', slots.default?.()) })
    const html = await renderToString(app)
    assert(!/(?:NaN|Infinity)/.test(html), 'Non-finite coordinate in rendered component')
    return html
  }
  const catalog = await render(Catalog)
  assert(catalog.includes('Математический анализ'))
  assert(catalog.includes('Дискретная математика'))
  for (const topic of [...discreteTopics, ...analysisTopics]) {
    const html = await render(Lesson, { topic, subjectTitle: analysisTopics.includes(topic) ? 'Математический анализ' : 'Дискретная математика' })
    assert(html.includes(topic.title), `Missing title: ${topic.id}`)
    assert(html.includes(topic.experiment), `Missing experiment: ${topic.id}`)
    assert(html.includes('discrete-lab'), `Missing laboratory: ${topic.id}`)
    if (analysisTopics.includes(topic)) assert(html.includes('coordinate-plot'), `Missing plot: ${topic.id}`)
  }
  assert((await render(Sets)).includes('Лаборатория множеств'))
  assert.deepEqual(warnings, [], 'Vue emitted rendering warnings')
  console.log('PASS: catalog and all 26 topics render without Vue warnings or non-finite values.')
} finally { await server.close() }
