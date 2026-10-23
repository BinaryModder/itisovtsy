export interface LibraryMaterial {
  id: string
  title: string
  subject: string
  course: number
  semester: number
  kind: string
  description: string
  url?: string
  filename?: string
  size?: string
}

// Illustrative catalog, not an official curriculum or a collection of real textbooks.
export const demoMaterials: LibraryMaterial[] = [
  { id: 'analysis-1', title: 'Математический анализ. Пределы и производные', subject: 'Математический анализ', course: 1, semester: 1, kind: 'Учебник', description: 'Пределы, непрерывность и дифференциальное исчисление. Пример карточки учебника для первого курса.' },
  { id: 'discrete-1', title: 'Дискретная математика. Множества и логика', subject: 'Дискретная математика', course: 1, semester: 1, kind: 'Конспект', description: 'Операции над множествами, высказывания и логические выражения. Пример карточки конспекта.' },
  { id: 'algebra-1', title: 'Линейная алгебра. Матрицы и системы', subject: 'Линейная алгебра', course: 1, semester: 1, kind: 'Практикум', description: 'Матрицы, определители и системы линейных уравнений. Пример карточки практикума.' },
  { id: 'analysis-2', title: 'Математический анализ. Интегралы и ряды', subject: 'Математический анализ', course: 1, semester: 2, kind: 'Учебник', description: 'Интегральное исчисление и числовые ряды. Пример материала для второго семестра.' },
  { id: 'algorithms-2', title: 'Алгоритмы и структуры данных', subject: 'Алгоритмы', course: 2, semester: 1, kind: 'Конспект', description: 'Сложность алгоритмов, сортировки, деревья и графы. Пример карточки учебного материала.' },
  { id: 'databases-3', title: 'Базы данных. От модели к SQL', subject: 'Базы данных', course: 3, semester: 1, kind: 'Практикум', description: 'Реляционная модель, SQL и проектирование схемы данных. Пример карточки практикума.' },
]

export function filterMaterials(materials: LibraryMaterial[], filters: { course: string; semester: string; subject: string; query: string }) {
  const query = filters.query.trim().toLocaleLowerCase('ru')
  return materials.filter(item => (!filters.course || item.course === Number(filters.course)) &&
    (!filters.semester || item.semester === Number(filters.semester)) &&
    (!filters.subject || item.subject === filters.subject) &&
    (!query || `${item.title} ${item.subject} ${item.kind} ${item.description}`.toLocaleLowerCase('ru').includes(query)))
}
