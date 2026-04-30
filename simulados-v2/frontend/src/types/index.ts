// src/types/index.ts
// Tipos globais compartilhados em todo o frontend

export interface User {
  id:         string
  name:       string
  email:      string
  created_at: string
}

export interface AuthTokens {
  access:  string
  refresh: string
  user:    User
}

export interface Simulado {
  id:             string
  title:          string
  description:    string
  subject:        string
  difficulty:     'easy' | 'medium' | 'hard'
  time_limit:     number
  question_count: number
  attempt_count:  number
}

export interface Question {
  id:        string
  statement: string
  option_a:  string
  option_b:  string
  option_c:  string
  option_d:  string
  order:     number
}

export interface SimuladoDetail extends Simulado {
  questions: Question[]
}

export type AnswerMap = Record<string, 'a' | 'b' | 'c' | 'd'>

export interface AnswerDetail {
  question_id:    string
  statement:      string
  option_a:       string
  option_b:       string
  option_c:       string
  option_d:       string
  chosen_option:  string | null
  correct_option: string
  explanation:    string
  is_correct:     boolean
}

export interface AttemptResult {
  attempt_id:     string
  simulado_title: string
  score:          number
  total:          number
  percentage:     number
  time_taken:     number
  answers:        AnswerDetail[]
}

export interface AttemptHistory {
  id:              string
  simulado_id:     string
  simulado_title:  string
  score:           number
  total_questions: number
  percentage:      number
  time_taken:      number
  completed_at:    string | null
}

export interface RankingItem {
  position:        number
  user_id:         string
  user_name:       string
  total_attempts:  number
  avg_percentage:  number
  best_percentage: number
  total_correct:   number
}
