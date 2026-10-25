import { describe, expect, test } from 'bun:test'
import { choose, euclid, graphProperties, normalForms, parity, relationProperties, selectionExamples, selections, sequence, type Edge } from '../src/data/discreteMath'
import { discreteTopics } from '../src/data/discrete'

describe('Комбинаторика', () => {
  test('Учитывает порядок, повторения и пустую выборку', () => {
    expect(selections(5, 2, false, false)).toBe(10)
    expect(selections(5, 2, true, false)).toBe(20)
    expect(selections(5, 2, false, true)).toBe(15)
    expect(selections(5, 2, true, true)).toBe(25)
    expect(selections(2, 3, true, false)).toBe(0)
    for (const ordered of [false, true]) for (const repeated of [false, true]) {
      expect(selections(5, 0, ordered, repeated)).toBe(1)
      expect(selectionExamples(5, 0, ordered, repeated)).toEqual(['∅'])
    }
    expect(choose(7, 3)).toBe(35)
  })
  test('Примеры не повторяются, соответствуют правилам и ограничены 24', () => {
    for (let n = 1; n <= 7; n++) for (let k = 1; k <= 5; k++) {
      for (const ordered of [false, true]) for (const repeated of [false, true]) {
        const examples = selectionExamples(n, k, ordered, repeated)
        expect(examples.length).toBe(Math.min(24, selections(n, k, ordered, repeated)))
        expect(new Set(examples).size).toBe(examples.length)
        for (const item of examples) {
          const values = item.split(' · ').map(Number)
          expect(values.length).toBe(k)
          expect(values.every(v => v >= 1 && v <= n)).toBe(true)
          if (!repeated) expect(new Set(values).size).toBe(k)
          if (!ordered) expect(values).toEqual([...values].sort((a,b) => a-b))
        }
      }
    }
  })
})

describe('Отношения', () => {
  test('Различает эквивалентность, порядок и отсутствие транзитивности', () => {
    const partition = [[true,true,false],[true,true,false],[false,false,true]]
    expect(relationProperties(partition)).toMatchObject({ equivalence: true, order: false, antisymmetric: false })
    const order = [[true,true,true],[false,true,true],[false,false,true]]
    expect(relationProperties(order)).toMatchObject({ order: true, equivalence: false })
    expect(relationProperties([[false,true,false],[false,false,true],[false,false,false]]).transitive).toBe(false)
    expect(relationProperties([[false,false,false],[false,false,false],[false,false,false]])).toMatchObject({ transitive: true, symmetric: true, reflexive: false })
  })
  test('Распознаёт ровно отношения, заданные разбиениями, среди всех 512 матриц', () => {
    const partitions = new Set<string>()
    for (let assignment = 0; assignment < 27; assignment++) {
      const labels = [assignment % 3, Math.floor(assignment/3) % 3, Math.floor(assignment/9)]
      partitions.add(JSON.stringify(labels.map(a => labels.map(b => a === b))))
    }
    for (let mask = 0; mask < 512; mask++) {
      const matrix = Array.from({length: 3}, (_, a) => Array.from({length: 3}, (_, b) => Boolean(mask & (1 << (a*3+b)))))
      expect(relationProperties(matrix).equivalence).toBe(partitions.has(JSON.stringify(matrix)))
    }
  })
})

describe('Графы', () => {
  test('Отличает дерево от несвязного графа с n−1 рёбрами', () => {
    expect(graphProperties(5, [[0,1],[1,2],[2,3],[3,4]]).tree).toBe(true)
    expect(graphProperties(5, [[0,1],[1,2],[2,0],[3,4]])).toMatchObject({tree: false, cycle: true, components: 2, bipartite: false})
    expect(graphProperties(5, []).components).toBe(5)
    expect(graphProperties(5, [[0,1],[1,2],[2,0]]).euler).toBe('Есть эйлеров цикл')
  })
  test('Все 1024 простых графа на пяти вершинах: независимый перебор раскрасок и проверка циклов', () => {
    const pairs: Edge[] = []
    for (let a = 0; a < 5; a++) for (let b = a+1; b < 5; b++) pairs.push([a,b])
    for (let mask = 0; mask < 1024; mask++) {
      const edges = pairs.filter((_, i) => mask & (1 << i))
      const actual = graphProperties(5, edges)
      const bipartite = Array.from({length: 32}, (_, i) => i).some(color => edges.every(([a,b]) => ((color >> a) & 1) !== ((color >> b) & 1)))
      const parent = [0,1,2,3,4]
      const root = (a: number): number => parent[a] === a ? a : root(parent[a]!)
      let cycle = false
      edges.forEach(([a,b]) => { const x = root(a), y = root(b); if (x === y) cycle = true; else parent[x] = y })
      expect(actual.bipartite).toBe(bipartite)
      expect(actual.cycle).toBe(cycle)
      expect(actual.components).toBe(new Set(parent.map((_, i) => root(i))).size)
      expect(actual.degrees.reduce((a,b) => a+b,0)).toBe(edges.length*2)
    }
  })
})

describe('Формулы и численные эксперименты', () => {
  test('СДНФ и СКНФ всех 16 функций совпадают с таблицами на всех входах', () => {
    const literal = (s: string, p: boolean, q: boolean) => s === 'p' ? p : s === 'q' ? q : s === '¬p' ? !p : !q
    function evaluate(s: string, dnf: boolean, p: boolean, q: boolean): boolean {
      if (s === '0' || s === '1') return s === '1'
      const parts = s.split(dnf ? ' ∨ ' : ' ∧ ').map(term => {
        const values = term.slice(1,-1).split(dnf ? ' ∧ ' : ' ∨ ').map(v => literal(v,p,q))
        return dnf ? values.every(Boolean) : values.some(Boolean)
      })
      return dnf ? parts.some(Boolean) : parts.every(Boolean)
    }
    for (let mask = 0; mask < 16; mask++) {
      const values = Array.from({length:4}, (_, i) => Boolean(mask & (1 << i)))
      const { dnf, cnf } = normalForms(values)
      for (let i = 0; i < 4; i++) {
        expect(evaluate(dnf, true, i >= 2, i % 2 === 1)).toBe(values[i]!)
        expect(evaluate(cnf, false, i >= 2, i % 2 === 1)).toBe(values[i]!)
      }
    }
  })
  test('Алгоритм Евклида совпадает с перебором общих делителей для всех допустимых входов', () => {
    for (let a = 1; a <= 100; a++) for (let b = 1; b <= 100; b++) {
      const result = euclid(a,b)
      let expected = 1
      for (let d = 1; d <= Math.min(a,b); d++) if (a%d === 0 && b%d === 0) expected = d
      expect(result.gcd).toBe(expected)
      for (const step of result.steps) { expect(step.a).toBe(step.q*step.b + step.r); expect(step.r).toBeLessThan(step.b) }
    }
  })
  test('Последовательности используют начальные условия и выбранное правило', () => {
    expect(sequence('fibonacci', 0, 1, 2)).toEqual([0,1,1,2,3,5,8,13,21])
    expect(sequence('fibonacci', 2, 3, 2, 5)).toEqual([2,3,5,8,13])
    expect(sequence('arithmetic', 2, 0, 3, 4)).toEqual([2,5,8,11])
    expect(sequence('geometric', 2, 0, 3, 4)).toEqual([2,6,18,54])
  })
  test('Бит чётности обнаруживает нечётное число переворотов при любых данных', () => {
    for (let word = 0; word < 16; word++) {
      const data = Array.from({length:4}, (_, i) => (word >> i) & 1)
      const sent = [...data, parity(data)]
      expect(parity(sent)).toBe(0)
      for (let errors = 0; errors < 32; errors++) {
        const received = sent.map((bit, i) => bit ^ ((errors >> i) & 1))
        expect(parity(received)).toBe(errors.toString(2).split('1').length % 2 === 0 ? 1 : 0)
      }
    }
  })
})

test('Каталог: 13 новых тем, 52 карточки, 39 вопросов с корректными индексами ответов', () => {
  expect(discreteTopics.length).toBe(13)
  expect(new Set(discreteTopics.map(topic => topic.id)).size).toBe(13)
  for (const topic of discreteTopics) {
    expect(topic.cards.length).toBe(4)
    expect(topic.questions.length).toBe(3)
    for (const question of topic.questions) {
      expect(question.answer).toBeGreaterThanOrEqual(0)
      expect(question.answer).toBeLessThan(question.options.length)
      expect(new Set(question.options).size).toBe(question.options.length)
      expect(question.explanation.length).toBeGreaterThan(10)
    }
  }
})
