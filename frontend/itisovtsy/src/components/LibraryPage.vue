<script setup lang="ts">
import { computed, onDeactivated, onUnmounted, reactive, ref, watch } from 'vue'
import { demoMaterials, filterMaterials, type LibraryMaterial } from '../data/library'

const materials = ref<LibraryMaterial[]>([...demoMaterials])
const sections = [
  { id: 'notes', title: 'Конспекты', description: 'Записи лекций и краткие разборы тем.', defaultKind: 'Конспект' },
  { id: 'practice', title: 'Практикумы', description: 'Задачи, упражнения и материалы для практических занятий.', defaultKind: 'Практикум' },
  { id: 'lectures', title: 'Лекции', description: 'Материалы лекций по предметам, курсам и семестрам.', defaultKind: 'Лекция' },
] as const
type SectionId = typeof sections[number]['id']
const activeSection = ref<SectionId>('notes')
function sectionFor(kind: string): SectionId {
  return kind === 'Конспект' ? 'notes' : kind === 'Лекция' ? 'lectures' : 'practice'
}
const currentSection = computed(() => sections.find(section => section.id === activeSection.value)!)
const sectionMaterials = computed(() => materials.value.filter(item => sectionFor(item.kind) === activeSection.value))
const sectionCounts = computed(() => Object.fromEntries(sections.map(section => [section.id, materials.value.filter(item => sectionFor(item.kind) === section.id).length])))
const filters = reactive({ course: '', semester: '', subject: '', query: '' })
const subjects = computed(() => [...new Set(filterMaterials(sectionMaterials.value, { ...filters, subject: '', query: '' }).map(item => item.subject))].sort((a, b) => a.localeCompare(b, 'ru')))
watch(subjects, values => { if (!values.includes(filters.subject)) filters.subject = '' })
const results = computed(() => filterMaterials(sectionMaterials.value, filters))
const selected = ref<LibraryMaterial | null>(null)
const preview = ref<HTMLDialogElement | null>(null)
const upload = ref<HTMLDialogElement | null>(null)
const uploadError = ref('')
const busy = ref(false)
const localFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const draft = reactive({ title: '', subject: '', course: '1', semester: '1', kind: 'Конспект' })
const notice = ref('')
const urls: string[] = []

function resetFilters() { Object.assign(filters, { course: '', semester: '', subject: '', query: '' }) }
function openMaterial(material: LibraryMaterial) { selected.value = material; preview.value?.showModal() }
function openUpload() {
  localFile.value = null
  if (fileInput.value) fileInput.value.value = ''
  uploadError.value = ''
  Object.assign(draft, { title: '', subject: '', course: filters.course || '1', semester: filters.semester || '1', kind: currentSection.value.defaultKind })
  upload.value?.showModal()
}
function chooseFile(event: Event) {
  localFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  if (localFile.value && !draft.title) draft.title = localFile.value.name.replace(/\.pdf$/i, '').slice(0, 140)
  uploadError.value = ''
}
async function addMaterial() {
  const file = localFile.value
  if (!file) { uploadError.value = 'Выбери PDF-файл.'; return }
  if (!draft.title.trim() || !draft.subject.trim()) { uploadError.value = 'Заполни название и предмет.'; return }
  if (file.size > 30 * 1024 * 1024) { uploadError.value = 'Выбери файл размером до 30 МБ.'; return }
  busy.value = true
  try {
    const signature = await file.slice(0, 5).text()
    if (signature !== '%PDF-') { uploadError.value = 'Этот файл не похож на PDF. Выбери документ в формате PDF.'; return }
    const url = URL.createObjectURL(file)
    urls.push(url)
    materials.value.unshift({ id: crypto.randomUUID(), title: draft.title.trim(), subject: draft.subject.trim(), course: Number(draft.course), semester: Number(draft.semester), kind: draft.kind, description: 'Локальный материал. Доступен только в этой вкладке до перезагрузки страницы.', url, filename: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} МБ` })
    activeSection.value = sectionFor(draft.kind)
    resetFilters()
    notice.value = `PDF добавлен в раздел «${currentSection.value.title}». Его можно открыть и скачать в этой вкладке.`
    upload.value?.close()
    localFile.value = null
  } catch {
    uploadError.value = 'Не удалось прочитать файл. Попробуй выбрать его ещё раз.'
  } finally { busy.value = false }
}
onDeactivated(() => { preview.value?.close(); upload.value?.close() })
onUnmounted(() => urls.forEach(url => URL.revokeObjectURL(url)))
</script>

<template>
  <main class="library-page" aria-labelledby="library-title">
    <div class="profile-breadcrumb"><RouterLink to="/">Главная</RouterLink><span aria-hidden="true">/</span><span>Библиотека</span><span class="profile-demo">DEMO</span></div>
    <div class="profile-heading library-heading"><div><p class="eyebrow">&gt;_ ЗНАНИЯ ПОД РУКОЙ</p><h1 id="library-title">Библиотека<span>.</span></h1><p class="library-subtitle">Всё для учёбы — по курсам и предметам.</p></div><button class="button button-primary" type="button" @click="openUpload">Добавить PDF <span aria-hidden="true">+</span></button></div>
    <div class="library-banner"><span aria-hidden="true">[ PDF ]</span><p>Меньше поисков.<br /><strong>Больше понимания.</strong></p><span class="library-banner-note">Конспекты / практикумы / лекции</span></div>
    <div class="activity-tabs library-sections" role="group" aria-label="Разделы библиотеки">
      <button v-for="section in sections" :key="section.id" type="button" :aria-pressed="activeSection === section.id" aria-controls="library-catalog" @click="activeSection = section.id; notice = ''">{{ section.title }} <span>{{ sectionCounts[section.id] }}</span></button>
    </div>
    <section id="library-catalog" aria-labelledby="library-section-title">
    <div class="library-section-heading"><h2 id="library-section-title">{{ currentSection.title }}</h2><p>{{ currentSection.description }}</p></div>
    <section class="library-filters" aria-label="Поиск материалов">
      <div class="library-search"><label for="library-search">Найти материал</label><input id="library-search" v-model="filters.query" type="search" placeholder="Название, предмет или тема…" /></div>
      <div class="library-selects"><div><label for="library-course">Курс</label><select id="library-course" v-model="filters.course"><option value="">Все курсы</option><option v-for="course in 4" :key="course" :value="String(course)">{{ course }} курс</option></select></div><div><label for="library-semester">Семестр курса</label><select id="library-semester" v-model="filters.semester"><option value="">Оба семестра</option><option value="1">1 семестр</option><option value="2">2 семестр</option></select></div><div><label for="library-subject">Предмет</label><select id="library-subject" v-model="filters.subject"><option value="">Все предметы</option><option v-for="subject in subjects" :key="subject" :value="subject">{{ subject }}</option></select></div></div>
    </section>
    <div class="library-results-heading"><p role="status">Найдено материалов: <strong>{{ results.length }}</strong></p><button type="button" class="library-reset" @click="resetFilters">Сбросить фильтры ↺</button></div>
    <p v-if="notice" class="profile-saved" role="status">{{ notice }}</p>
    <div v-if="results.length" class="library-grid"><article v-for="material in results" :key="material.id" class="material-card"><div class="material-top"><span class="material-file" aria-hidden="true">PDF<span>↗</span></span><span class="material-kind">{{ material.kind }}</span></div><p class="material-course">{{ material.course }} курс / {{ material.semester }} семестр</p><h2>{{ material.title }}</h2><p class="material-subject">{{ material.subject }}</p><div class="material-bottom"><span>{{ material.url ? `Локальный PDF · ${material.size}` : 'Демокарточка · без файла' }}</span><button type="button" :aria-label="`${material.url ? 'Открыть PDF' : 'Подробнее'}: ${material.title}`" @click="openMaterial(material)">{{ material.url ? 'Открыть' : 'Подробнее' }} ↗</button></div></article></div>
    <div v-else class="library-empty"><span aria-hidden="true">[ ? ]</span><h2>В этом разделе ничего не нашлось</h2><p>Попробуй другой запрос, сбрось фильтры или выбери другой раздел.</p><button class="button button-outline" type="button" @click="resetFilters">Сбросить фильтры</button></div>
    </section>
    <p class="profile-demo-note">Демокаталог: названия и распределение по курсам приведены для примера. Файлы к демонстрационным карточкам ещё не добавлены. Локальные PDF не отправляются на сервер.</p>

    <dialog ref="preview" class="library-preview" aria-labelledby="material-title" @click="($event.target === preview) && preview?.close()"><template v-if="selected"><div class="preview-heading"><div><span class="mock-label">{{ selected.subject }}</span><h2 id="material-title">{{ selected.title }}</h2></div><button type="button" class="close-button" aria-label="Закрыть просмотр" @click="preview?.close()">×</button></div><template v-if="selected.url"><iframe :src="selected.url" :title="`Просмотр PDF: ${selected.title}`" class="pdf-viewer"></iframe><div class="preview-footer"><p>Если PDF не отображается, открой его отдельно.</p><a :href="selected.url" target="_blank" rel="noopener" class="button button-outline">Открыть ↗</a><a :href="selected.url" :download="selected.filename" class="button button-primary">Скачать ↓</a></div></template><div v-else class="preview-placeholder"><span aria-hidden="true">[ PDF ]</span><p>{{ selected.description }}</p><p>Файл ещё не добавлен. Чтобы попробовать просмотр и скачивание, добавь свой PDF через кнопку «Добавить PDF».</p><button type="button" class="button button-outline" @click="preview?.close(); openUpload()">Добавить PDF</button></div></template></dialog>
    <dialog ref="upload" class="auth-dialog" aria-labelledby="upload-title" @cancel="busy && $event.preventDefault()"><div class="dialog-content"><div class="registration-top"><span class="mock-label">БИБЛИОТЕКА / LOCAL</span><button class="close-button" type="button" :disabled="busy" aria-label="Закрыть добавление PDF" @click="upload?.close()">×</button></div><h2 id="upload-title">На твою полку</h2><p>Добавь PDF для просмотра в этой вкладке. После перезагрузки он исчезнет из каталога.</p><form class="registration-form" @submit.prevent="addMaterial"><div class="form-field"><label for="pdf-file">PDF-файл · до 30 МБ</label><input id="pdf-file" ref="fileInput" type="file" accept="application/pdf,.pdf" required :disabled="busy" @change="chooseFile" /></div><div class="form-field"><label for="pdf-title">Название</label><input id="pdf-title" v-model="draft.title" required maxlength="140" :disabled="busy" /></div><div class="form-field"><label for="pdf-subject">Предмет</label><input id="pdf-subject" v-model="draft.subject" required maxlength="80" list="subject-suggestions" :disabled="busy" /><datalist id="subject-suggestions"><option v-for="subject in [...new Set(materials.map(item => item.subject))]" :key="subject" :value="subject" /></datalist></div><div class="upload-selects"><div class="form-field"><label for="pdf-course">Курс</label><select id="pdf-course" v-model="draft.course" :disabled="busy"><option v-for="course in 4" :key="course" :value="String(course)">{{ course }} курс</option></select></div><div class="form-field"><label for="pdf-semester">Семестр курса</label><select id="pdf-semester" v-model="draft.semester" :disabled="busy"><option value="1">1 семестр</option><option value="2">2 семестр</option></select></div></div><div class="form-field"><label for="pdf-kind">Тип материала</label><select id="pdf-kind" v-model="draft.kind" :disabled="busy"><option>Конспект</option><option>Практикум</option><option>Лекция</option></select></div><p v-if="uploadError" class="field-error" role="alert">{{ uploadError }}</p><button class="button button-primary registration-submit" type="submit" :disabled="busy">{{ busy ? 'Проверяем файл…' : 'Добавить в каталог' }} <span aria-hidden="true">+</span></button></form></div></dialog>
  </main>
</template>
