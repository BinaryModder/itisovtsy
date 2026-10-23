export interface Answer {
  id: string
  authorId: string
  author: string
  body: string
  createdAt: number
}

export interface Question {
  id: string
  title: string
  body: string
  course: number
  subject: string
  authorId: string
  author: string
  createdAt: number
  answers: Answer[]
  acceptedAnswerId: string | null
}

export const demoUserId = 'local-student'
export const questionSubjects = ['Математический анализ', 'Дискретная математика', 'Программирование', 'Алгоритмы', 'Базы данных', 'Дипломный проект']
export const demoQuestions: Question[] = [
  { id: 'limit', title: 'Как понять, какой метод использовать для вычисления предела?', body: 'Разбираю пределы с неопределённостью 0/0. Иногда помогает разложение на множители, иногда — замечательные пределы. Как выбирать подход? Хотелось бы понять на примере lim(x → 0) sin(3x) / x.', course: 1, subject: 'Математический анализ', authorId: 'anna', author: 'Анна Крылова', createdAt: Date.UTC(2026, 9, 23, 10), acceptedAnswerId: null, answers: [{ id: 'limit-answer', authorId: 'mikhail', author: 'Михаил Орлов', body: 'В этом примере можно привести выражение к первому замечательному пределу:\n\nsin(3x) / x = 3 · sin(3x) / (3x).\n\nПри x → 0 дробь sin(3x) / (3x) стремится к 1, поэтому ответ — 3. Сначала посмотри, можно ли преобразовать выражение к уже знакомому пределу.', createdAt: Date.UTC(2026, 9, 23, 11) }] },
  { id: 'logic', title: 'Чем импликация отличается от обычного «если — то»?', body: 'Не понимаю, почему импликация считается истинной, если посылка ложна. Как это объяснить без заучивания таблицы истинности?', course: 1, subject: 'Дискретная математика', authorId: 'daria', author: 'Дарья Волкова', createdAt: Date.UTC(2026, 9, 23, 9), answers: [], acceptedAnswerId: null },
  { id: 'api', title: 'Как связать Vue с API на ASP.NET Core?', body: 'Фронтенд работает на Vite, бэкенд запускаю отдельно. Как удобнее организовать запросы при локальной разработке и что делать с CORS?', course: 2, subject: 'Программирование', authorId: demoUserId, author: 'Алексей Смирнов', createdAt: Date.UTC(2026, 9, 22, 14), acceptedAnswerId: null, answers: [{ id: 'api-answer', authorId: 'timur', author: 'Тимур Сафин', body: 'Для разработки можно настроить server.proxy в Vite: запросы на /api будут перенаправляться к бэкенду. Тогда фронтенд сможет обращаться к относительным адресам, например fetch("/api/questions").\n\nЕсли обращаешься к API напрямую на другом origin, настрой CORS на бэкенде для конкретного адреса фронтенда.', createdAt: Date.UTC(2026, 9, 22, 15) }] },
  { id: 'graphs', title: 'Когда использовать BFS, а когда DFS?', body: 'Оба алгоритма обходят граф, но как выбирать между ними? Особенно интересует поиск кратчайшего пути в невзвешенном графе.', course: 2, subject: 'Алгоритмы', authorId: 'ivan', author: 'Иван Петров', createdAt: Date.UTC(2026, 9, 22, 10), acceptedAnswerId: 'graphs-answer', answers: [{ id: 'graphs-answer', authorId: 'anna', author: 'Анна Крылова', body: 'Для кратчайшего пути по числу рёбер в невзвешенном графе подходит BFS: он посещает вершины по уровням расстояния от старта. DFS полезен, например, для исследования связности и поиска циклов, но сам по себе не гарантирует кратчайший путь.', createdAt: Date.UTC(2026, 9, 22, 11) }] },
  { id: 'database', title: 'Нужна ли отдельная таблица для начисления опыта?', body: 'Делаю систему уровней. Достаточно хранить число XP у пользователя или лучше записывать каждое начисление отдельно? Как потом отменять баллы за удалённый ответ?', course: 3, subject: 'Базы данных', authorId: 'timur', author: 'Тимур Сафин', createdAt: Date.UTC(2026, 9, 21, 12), answers: [], acceptedAnswerId: null },
  { id: 'diploma', title: 'Как ограничить объём дипломного проекта?', body: 'Хочется сделать полезный сервис, но список функций постоянно растёт. Как выделить минимальную версию и определить, что оставить на будущее?', course: 4, subject: 'Дипломный проект', authorId: 'mikhail', author: 'Михаил Орлов', createdAt: Date.UTC(2026, 9, 20, 12), answers: [], acceptedAnswerId: null },
]

export interface QuestionFilters {
  course: string
  subject: string
  query: string
  status: 'all' | 'unanswered' | 'solved' | 'mine'
  sort: 'newest' | 'active'
}
export function filterQuestions(questions: Question[], filters: QuestionFilters, userId: string) {
  const query = filters.query.trim().toLocaleLowerCase('ru')
  return questions.filter(question =>
    (!filters.course || question.course === Number(filters.course)) &&
    (!filters.subject || question.subject === filters.subject) &&
    (!query || `${question.title} ${question.body} ${question.subject}`.toLocaleLowerCase('ru').includes(query)) &&
    (filters.status !== 'unanswered' || question.answers.length === 0) &&
    (filters.status !== 'solved' || Boolean(question.acceptedAnswerId)) &&
    (filters.status !== 'mine' || question.authorId === userId),
  ).sort((a, b) => filters.sort === 'active' ? b.answers.length - a.answers.length || b.createdAt - a.createdAt : b.createdAt - a.createdAt)
}
export function toggleAcceptedAnswer(question: Question, answerId: string, userId: string) {
  if (question.authorId !== userId || !question.answers.some(answer => answer.id === answerId)) return false
  question.acceptedAnswerId = question.acceptedAnswerId === answerId ? null : answerId
  return true
}
export function validateQuestion(title: string, body: string) {
  return {
    title: title.trim().length < 10 ? 'Добавь подробностей в заголовок — минимум 10 символов.' : title.trim().length > 140 ? 'Сократи заголовок до 140 символов.' : '',
    body: body.trim().length < 20 ? 'Опиши задачу подробнее — минимум 20 символов.' : body.trim().length > 5000 ? 'Сократи описание до 5000 символов.' : '',
  }
}
