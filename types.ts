export interface QuestionTime {
  questionNumber: number
  timeSpent: number
  targetTime: number
  status: "completed" | "passed" | "wrong"
  marks: number
  remark?: string
}

