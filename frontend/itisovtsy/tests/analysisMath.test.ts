import { expect, test } from 'bun:test'
import { analysisKinds, analysisTopics } from '../src/data/analysis'
import { discreteTopics } from '../src/data/discrete'
import { derivativeValue, epsilonIndex, exponentialErrorBound, exponentialTaylor, functionValue, geometricPartial, gradientAt, powerIntegral, rectangleIntegral, riemannSum, sampleCurve, secantSlope, sequenceValue, type FunctionKind } from '../src/data/analysisMath'

test('N гарантирует ε-оценку для обоих сходящихся примеров', () => {
  for (let i=1; i<=20; i++) {
    const eps=i*.025, n=epsilonIndex(eps)
    for (const kind of ['inverse','alternating'] as const) for (let k=n+1;k<=n+200;k++) expect(Math.abs(sequenceValue(kind,k))).toBeLessThan(eps)
    expect(Math.abs(sequenceValue('oscillating',n+1))).toBeGreaterThan(eps)
  }
})
test('Секущие совпадают с разностным отношением и сходятся к производной с обеих сторон', () => {
  for (const kind of ['square','cube','sin','linear'] as FunctionKind[]) for (const a of [-1,-.3,0,.7,1]) {
    for (const h of [-1,-.02,.02,1]) expect(secantSlope(kind,a,h)).toBeCloseTo((functionValue(kind,a+h)-functionValue(kind,a))/h,10)
    for (const h of [-1e-7,1e-7]) expect(secantSlope(kind,a,h)).toBeCloseTo(derivativeValue(kind,a),5)
  }
  expect(()=>secantSlope('square',1,0)).toThrow()
})
test('Интегралы: точные формулы, смена направления и нулевой интервал', () => {
  expect(riemannSum('square',0,1,20,'middle').exact).toBeCloseTo(1/3,12)
  expect(riemannSum('square',0,-1,20,'middle').exact).toBeCloseTo(-1/3,12)
  expect(riemannSum('linear',0,-2,20,'middle').exact).toBe(2)
  expect(riemannSum('sin',0,Math.PI,20,'middle').exact).toBe(2)
  for (const method of ['start','middle','end'] as const) {
    const result=riemannSum('square',0,0,12,method)
    expect(result.sum).toBe(0); expect(result.exact).toBe(0)
    expect(result.rectangles.every(rect=>rect.dx===0)).toBe(true)
  }
})
test('Суммы Римана: известная ошибка для квадрата, точность для линейной функции', () => {
  for (const b of [-2,-1,.5,1,2]) for (const n of [2,8,60]) {
    expect(riemannSum('square',0,b,n,'middle').sum).toBeCloseTo(b**3/3-b**3/(12*n*n),10)
    expect(riemannSum('linear',0,b,n,'middle').sum).toBeCloseTo(b*b/2,10)
  }
  expect(riemannSum('square',0,1,10,'start').sum).toBeLessThan(1/3)
  expect(riemannSum('square',0,1,10,'end').sum).toBeGreaterThan(1/3)
})
test('Несобственные интегралы: p<1, p=1, p>1 и предел формулы около p=1', () => {
  for (const b of [1,2,5,20]) {
    expect(powerIntegral(1,b)).toBeCloseTo(Math.log(b),12)
    expect(powerIntegral(2,b)).toBeCloseTo(1-1/b,12)
    expect(powerIntegral(.5,b)).toBeCloseTo(2*(Math.sqrt(b)-1),12)
    expect(powerIntegral(1+1e-8,b)).toBeCloseTo(Math.log(b),6)
  }
  expect(()=>powerIntegral(2,0)).toThrow()
})
test('Двойной интеграл согласован с суммой по ячейкам для линейной поверхности', () => {
  for (const a of [.25,1,3]) for (const b of [.25,1.5,3]) {
    let sum=0
    for (let i=0;i<8;i++) for (let j=0;j<8;j++) sum+=((i+.5)*a/8+(j+.5)*b/8)*a*b/64
    expect(rectangleIntegral(a,b)).toBeCloseTo(sum,12)
    expect(rectangleIntegral(a,b)/(a*b)).toBeCloseTo((a+b)/2,12)
  }
})
test('Геометрические суммы корректны при q=0, ±1 и при расходимости ряда', () => {
  for (const q of [-1.1,-1,-.5,0,.5,1,1.1]) for (const n of [1,2,12,40]) expect(geometricPartial(q,n)).toBeCloseTo(q===1 ? n : (1-q**n)/(1-q),9)
})
test('Ошибка Тейлора ограничена оценкой Лагранжа во всём диапазоне лаборатории', () => {
  expect(exponentialTaylor(2,0)).toBe(1)
  expect(exponentialTaylor(2,2)).toBe(5)
  for (let degree=0;degree<=10;degree++) for (let i=-20;i<=20;i++) {
    const x=i/10, error=Math.abs(Math.exp(x)-exponentialTaylor(x,degree))
    expect(error).toBeLessThanOrEqual(exponentialErrorBound(x,degree)+1e-12)
  }
})
test('Градиент нормален к линии уровня и даёт правильную производную по направлению', () => {
  expect(gradientAt(1,2)).toEqual({x:2,y:4,value:5,norm:2*Math.sqrt(5)})
  expect(gradientAt(0,0)).toEqual({x:0,y:0,value:0,norm:0})
  const {x,y}=gradientAt(1,2)
  expect(x*(-2)+y).toBe(0)
  for (const angle of [0,Math.PI/4,Math.PI/2,Math.PI]) {
    const h=1e-6, dx=Math.cos(angle), dy=Math.sin(angle)
    expect(x*dx+y*dy).toBeCloseTo(((1+h*dx)**2+(2+h*dy)**2-5)/h,4)
  }
})
test('Выборка кривой сохраняет границы и конечные координаты', () => {
  const points=sampleCurve(Math.exp,-2,2)
  expect(points.length).toBe(201)
  expect(points[0]).toEqual({x:-2,y:Math.exp(-2)})
  expect(points.at(-1)).toEqual({x:2,y:Math.exp(2)})
  expect(points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y))).toBe(true)
})
test('12 тем, 48 карточек, 36 вопросов; ключи обоих предметов уникальны', () => {
  expect(analysisTopics.map(t=>t.id)).toEqual([...analysisKinds])
  expect(analysisTopics.reduce((s,t)=>s+t.cards.length,0)).toBe(48)
  expect(analysisTopics.reduce((s,t)=>s+t.questions.length,0)).toBe(36)
  const ids=['sets',...discreteTopics.map(t=>t.id),...analysisTopics.map(t=>t.id)]
  expect(new Set(ids).size).toBe(26)
  for (const topic of analysisTopics) for (const question of topic.questions) {
    expect(question.answer).toBeGreaterThanOrEqual(0)
    expect(question.answer).toBeLessThan(question.options.length)
    expect(new Set(question.options).size).toBe(question.options.length)
    expect(question.explanation.length).toBeGreaterThan(10)
  }
})
