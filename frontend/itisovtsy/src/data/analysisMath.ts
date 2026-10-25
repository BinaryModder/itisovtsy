export interface PlotPoint { x: number; y: number }
export interface PlotLine { points: PlotPoint[]; color?: string; dashed?: boolean; label: string }
export type FunctionKind = 'square' | 'cube' | 'sin' | 'linear'
export const functionValue = (kind: FunctionKind, x: number): number => kind === 'square' ? x*x : kind === 'cube' ? x*x*x : kind === 'linear' ? x : Math.sin(x)
export const derivativeValue = (kind: FunctionKind, x: number): number => kind === 'square' ? 2*x : kind === 'cube' ? 3*x*x : kind === 'linear' ? 1 : Math.cos(x)
export const primitiveValue = (kind: FunctionKind, x: number): number => kind === 'square' ? x**3/3 : kind === 'cube' ? x**4/4 : kind === 'linear' ? x*x/2 : -Math.cos(x)
export function sampleCurve(fn: (x: number) => number, min: number, max: number, steps = 200): PlotPoint[] {
  return Array.from({ length: steps+1 }, (_, i) => { const x = min+(max-min)*i/steps; return { x, y: fn(x) } })
}
export function secantSlope(kind: FunctionKind, a: number, h: number): number {
  // Algebraic forms avoid cancellation as the two points approach each other.
  if (h === 0) throw new RangeError('Секущая требует h≠0')
  if (kind === 'square') return 2*a+h
  if (kind === 'cube') return 3*a*a+3*a*h+h*h
  if (kind === 'linear') return 1
  return 2*Math.cos(a+h/2)*Math.sin(h/2)/h
}
export function riemannSum(kind: FunctionKind, a: number, b: number, count: number, method: 'start' | 'middle' | 'end') {
  const dx = (b-a)/count
  const offset = method === 'start' ? 0 : method === 'end' ? 1 : .5
  const rectangles = Array.from({ length: count }, (_, i) => ({ x: a+i*dx, dx, y: functionValue(kind, a+(i+offset)*dx) }))
  return { rectangles, sum: rectangles.reduce((sum, rect) => sum+rect.y*dx, 0), exact: primitiveValue(kind,b)-primitiveValue(kind,a) }
}
export function powerIntegral(p: number, upper: number): number {
  if (upper < 1) throw new RangeError('Верхняя граница должна быть ≥1')
  return Math.abs(p-1) < 1e-12 ? Math.log(upper) : Math.expm1((1-p)*Math.log(upper))/(1-p)
}
export function geometricPartial(q: number, count: number): number {
  let term = 1, sum = 0
  for (let i = 0; i < count; i++) { sum += term; term *= q }
  return sum
}
export function exponentialTaylor(x: number, degree: number): number {
  let term = 1, sum = 1
  for (let k = 1; k <= degree; k++) { term *= x/k; sum += term }
  return sum
}
export function exponentialErrorBound(x: number, degree: number): number {
  let term = 1
  for (let k = 1; k <= degree+1; k++) term *= Math.abs(x)/k
  return Math.exp(Math.max(0,x))*term
}
export function sequenceValue(kind: 'inverse' | 'alternating' | 'oscillating', n: number): number {
  return kind === 'oscillating' ? (-1)**n : (kind === 'alternating' ? (-1)**n : 1)/n
}
export function epsilonIndex(epsilon: number): number { return Math.ceil(1/epsilon) }
export function rectangleIntegral(a: number, b: number): number { return a*b*(a+b)/2 }
export function gradientAt(x: number, y: number) { return { x: 2*x, y: 2*y, value: x*x+y*y, norm: 2*Math.hypot(x,y) } }
