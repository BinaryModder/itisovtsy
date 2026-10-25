export interface TheoryCard { title: string; formula: string; explanation: string; example: string; caution: string }
export interface QuizQuestion { prompt: string; options: string[]; answer: number; explanation: string }
export interface PracticeTopic<Id extends string = string> {
  id: Id
  title: string
  symbol: string
  description: string
  extra?: boolean
  experiment: string
  challenge: string
  cards: TheoryCard[]
  questions: QuizQuestion[]
}
export const card = (title: string, formula: string, explanation: string, example: string, caution: string): TheoryCard => ({ title, formula, explanation, example, caution })
export const quiz = (prompt: string, options: string[], answer: number, explanation: string): QuizQuestion => ({ prompt, options, answer, explanation })
