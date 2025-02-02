export interface Quote {
  quote: string
  author: string
}

export interface QuestionTime {
  questionNumber: number
  timeSpent: number
  targetTime: number
  status: "completed" | "passed" | "wrong"
  marks: number
  remark?: string
}

