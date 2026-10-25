# itisovtsy

This template should help get you started developing with Vue 3 in Vite.

## Routing

Vue Router uses Web History: `/`, `/library`, `/questions`, `/profile`.
Routes are defined in `src/router/index.ts`; `/profile` waits for session restoration and requires an authenticated account.
`src/composables/useAuth.ts` shares account state and a single `/api/auth/me` request between the app and router.
Nginx serves `index.html` for direct page requests through `try_files $uri $uri/ /index.html`.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
bun install
```

### Compile and Hot-Reload for Development

```sh
bun dev
```

### Type-Check, Compile and Minify for Production

```sh
bun run build
```

## Демонстрационный практикум

`/practice` — выбор предмета и каталог тем. Дискретная математика: 14 тем, 56 карточек и 43 вопроса. Математический анализ: 12 тем, 48 карточек и 36 вопросов. В каждой теме есть лаборатория. Поиск и фильтр основных/дополнительных тем работают внутри выбранного предмета.

Темы дискретной математики: множества, логика и кванторы, булевы функции, отношения, отображения, комбинаторика, графы, деревья, доказательства и индукция, рекуррентности и производящие функции, теория чисел, вероятность, автоматы, коды и конечные поля. Это базовый обзор: лаборатория иллюстрирует выбранные понятия каждой темы, остальные рассматриваются в карточках.

- `src/views/PracticeView.vue` — каталог, поиск и результаты проверок.
- `src/data/practiceTypes.ts` — общий контракт темы, карточки и вопроса.
- `src/data/discrete.ts`, `src/data/analysis.ts` — учебный контент двух предметов и задания.
- `src/data/discreteMath.ts`, `src/data/analysisMath.ts` — чистые математические функции.
- `src/components/practice/TopicLesson.vue` — общий экран карточек, эксперимента и проверки с повторением ошибок.
- `SetLesson.vue` — исходная лаборатория множеств.
- `AnalysisLab.vue` — эксперименты матанализа; `CoordinatePlot.vue` — SVG-графики с сеткой, осями, легендой и обрезкой кривых по области построения. Для геометрии нескольких переменных масштабы осей одинаковы.
- `LogicLab.vue`, `StructureLab.vue`, `CountingLab.vue`, `StateLab.vue` — интерактивные эксперименты на Vue и SVG.

Раздел доступен без входа и не обращается к API. Состояние лабораторий и проверок сохраняется через KeepAlive при переключении предметов, тем и разделов до перезагрузки страницы. Результат в каталоге обновляется после завершения проверки; повторение ошибок обновляет ответы соответствующих вопросов. Настоящего долговременного прогресса и начисления XP пока нет.

Вопросы фиксированные, по одному правильному варианту; исходная тема множеств использует выбор элементов. Дополнительные темы и ссылки на учебные программы указаны в каталоге.

Проверки: `bun run build` и `bun run test`. Тесты проверяют комбинации с повторениями и без, все отношения на трёх элементах, все простые графы на пяти вершинах, все булевы функции от двух переменных, алгоритм Евклида, последовательности и контроль чётности.

### Математический анализ

Темы: числовые последовательности; предел функции; непрерывность; производная и касательная; исследование функций; первообразная и методы интегрирования; определённый и несобственный интегралы; числовые ряды; Тейлор и степенные ряды; функции нескольких переменных; кратные интегралы. Последние две темы помечены дополнительными.

Эксперименты содержат ε-полосу, приближение с двух сторон, доопределение в точке, секущую и касательную, движение экстремумов, семейство первообразных, суммы Римана (включая обратное направление), степенной несобственный интеграл, геометрические суммы, многочлены экспоненты, карту градиента и область двойного интеграла. Это фиксированные учебные примеры, а не произвольный символьный калькулятор. Округлённые результаты обозначены в интерфейсе; конечные наблюдения не выдаются за доказательства сходимости.

Дополнительные проверки: `bun run test:render` выполняет серверный рендеринг каталога и всех 26 тем без браузера. Он не заменяет визуальную и интерактивную проверку браузером. Тесты матанализа проверяют приближения производных, ориентацию и ошибки сумм Римана, критерии степенных интегралов, оценку остатка Тейлора и вычисление градиента.
