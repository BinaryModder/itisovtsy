export function factorial(n: number): number { let result = 1; for (let i = 2; i <= n; i++) result *= i; return result }
export function choose(n: number, k: number): number { return k < 0 || k > n ? 0 : factorial(n) / factorial(k) / factorial(n - k) }
export function selections(n: number, k: number, ordered: boolean, repeated: boolean): number {
  return ordered ? repeated ? n ** k : k > n ? 0 : factorial(n) / factorial(n - k) : repeated ? choose(n + k - 1, k) : choose(n, k)
}
export function selectionExamples(n: number, k: number, ordered: boolean, repeated: boolean): string[] {
  const out: string[] = []
  function visit(items: number[]) {
    if (out.length >= 24) return
    if (items.length === k) { out.push(items.length ? items.join(' · ') : '∅'); return }
    for (let i = 1; i <= n; i++) {
      if (!repeated && items.includes(i)) continue
      if (!ordered && items.length && i < items[items.length - 1]!) continue
      visit([...items, i])
    }
  }
  visit([])
  return out
}
export function relationProperties(matrix: boolean[][]) {
  const ids = matrix.map((_, i) => i)
  const has = (a: number, b: number) => Boolean(matrix[a]?.[b])
  const reflexive = ids.every(a => has(a, a))
  const symmetric = ids.every(a => ids.every(b => !has(a, b) || has(b, a)))
  const antisymmetric = ids.every(a => ids.every(b => a === b || !has(a, b) || !has(b, a)))
  const transitive = ids.every(a => ids.every(b => ids.every(c => !has(a, b) || !has(b, c) || has(a, c))))
  return { reflexive, symmetric, antisymmetric, transitive, equivalence: reflexive && symmetric && transitive, order: reflexive && antisymmetric && transitive }
}
export type Edge = [number, number]
export function graphProperties(n: number, edges: Edge[]) {
  const adjacent: number[][] = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adjacent[a]!.push(b); adjacent[b]!.push(a) })
  const colors = Array<number>(n).fill(-1)
  let components = 0, bipartite = true
  for (let start = 0; start < n; start++) {
    if (colors[start] !== -1) continue
    components++; colors[start] = 0
    const queue = [start]
    while (queue.length) {
      const a = queue.shift()!
      for (const b of adjacent[a]!) {
        if (colors[b] === -1) { colors[b] = 1 - colors[a]!; queue.push(b) }
        else if (colors[b] === colors[a]) bipartite = false
      }
    }
  }
  const degrees = adjacent.map(neighbors => neighbors.length)
  const odd = degrees.filter(d => d % 2).length
  const isolated = degrees.filter(d => d === 0).length
  const edgeConnected = components - isolated <= 1
  return { degrees, components, bipartite, colors, odd, cycle: edges.length > n - components, tree: components === 1 && edges.length === n - 1,
    euler: edges.length === 0 ? 'Нет рёбер: только маршрут длины 0' : !edgeConnected ? 'Нет: рёбра в разных компонентах' : odd === 0 ? 'Есть эйлеров цикл' : odd === 2 ? 'Есть открытый эйлеров путь' : 'Нет: больше двух нечётных вершин' }
}
export function euclid(a: number, b: number) {
  const steps: { a: number; b: number; q: number; r: number }[] = []
  while (b !== 0) { const r = a % b; steps.push({ a, b, q: Math.floor(a / b), r }); a = b; b = r }
  return { gcd: a, steps }
}
export function normalForms(values: boolean[]) {
  const terms = values.map((_, i) => [i >= 2, i % 2 === 1])
  const dnf = terms.filter((_, i) => values[i]).map(bits => `(${bits[0] ? 'p' : '¬p'} ∧ ${bits[1] ? 'q' : '¬q'})`).join(' ∨ ') || '0'
  const cnf = terms.filter((_, i) => !values[i]).map(bits => `(${bits[0] ? '¬p' : 'p'} ∨ ${bits[1] ? '¬q' : 'q'})`).join(' ∧ ') || '1'
  return { dnf, cnf }
}
export function sequence(kind: string, first: number, second: number, factor: number, count = 9) {
  const values = [first]
  if (kind === 'fibonacci') values.push(second)
  while (values.length < count) {
    const i = values.length
    values.push(kind === 'fibonacci' ? values[i - 1]! + values[i - 2]! : kind === 'geometric' ? values[i - 1]! * factor : values[i - 1]! + factor)
  }
  return values
}
export function parity(bits: number[]): number { return bits.reduce((a, b) => a ^ b, 0) }
