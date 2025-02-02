"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, Forward, Clock, Brain, X, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { QuestionTime } from "./types"

export default function QuestionTimer() {
  const [phase, setPhase] = useState<"setup" | "timing" | "result">("setup")
  const [targetTime, setTargetTime] = useState<number>(5)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [questionNumber, setQuestionNumber] = useState<number>(1)
  const [history, setHistory] = useState<QuestionTime[]>([])
  const [correctMarks, setCorrectMarks] = useState<number>(4)
  const [negativeMarks, setNegativeMarks] = useState<number>(1)
  const [currentRemark, setCurrentRemark] = useState<string>("")
  const warningCount = useRef(0)
  const totalMarks = history.reduce((sum, item) => sum + item.marks, 0)

  // Continuous timer for total time
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Question timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  // Window blur detection
  useEffect(() => {
    if (!isRunning) return

    const handleBlur = () => {
      warningCount.current += 1
      if (warningCount.current <= 2) {
        toast.warning(`Warning ${warningCount.current}/2: Please stay in the window!`, {
          description: "Your question will be marked as wrong after 2 warnings.",
        })
      } else {
        completeQuestion("wrong")
        toast.error("Question marked as wrong due to multiple window switches!")
      }
    }

    window.addEventListener("blur", handleBlur)
    return () => window.removeEventListener("blur", handleBlur)
  }, [isRunning])

  const startQuestion = () => {
    if (phase === "setup") {
      setPhase("timing")
    }
    setCurrentTime(0)
    setIsRunning(true)
    warningCount.current = 0
  }

  const completeQuestion = (status: "completed" | "passed" | "wrong") => {
    setIsRunning(false)
    setPhase("result")
    setCurrentRemark("")

    let marks = 0
    if (status === "completed") marks = correctMarks
    if (status === "wrong") marks = -negativeMarks

    setHistory((prev) => [
      ...prev,
      {
        questionNumber,
        timeSpent: currentTime,
        targetTime: targetTime * 60,
        status,
        marks,
      },
    ])
  }

  const nextQuestion = () => {
    const updatedHistory = [...history]
    if (currentRemark) {
      updatedHistory[updatedHistory.length - 1].remark = currentRemark
    }
    setHistory(updatedHistory)
    setQuestionNumber((prev) => prev + 1)
    setPhase("timing")
    startQuestion()
  }

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const formatTotalTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  const getTimeStatus = (spent: number, target: number, status: "completed" | "passed" | "wrong") => {
    if (status === "wrong") return "text-destructive"
    if (status === "passed") return "text-blue-500"
    if (spent <= target) return "text-green-500"
    if (spent <= target * 1.5) return "text-yellow-500"
    return "text-red-500"
  }

  const getStatusIcon = (status: "completed" | "passed" | "wrong") => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />
      case "passed":
        return <Forward className="h-5 w-5 text-blue-500" />
      case "wrong":
        return <X className="h-5 w-5 text-destructive" />
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Study Timer</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Total Time</span>
                </div>
                <span className="text-xl font-bold">{formatTotalTime(totalTime)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Total Score</span>
                </div>
                <span className="text-xl font-bold">{totalMarks}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {phase === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle>Question Timer Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timePerQuestion">Minutes per question</Label>
                <Input
                  id="timePerQuestion"
                  type="number"
                  min="1"
                  value={targetTime}
                  onChange={(e) => setTargetTime(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correctMarks">Marks for correct answer</Label>
                <Input
                  id="correctMarks"
                  type="number"
                  min="0"
                  value={correctMarks}
                  onChange={(e) => setCorrectMarks(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="negativeMarks">Negative marking</Label>
                <Input
                  id="negativeMarks"
                  type="number"
                  min="0"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(Number(e.target.value))}
                />
              </div>
              <Button onClick={startQuestion} className="w-full">
                Start First Question
              </Button>
            </CardContent>
          </Card>
        )}

        {phase === "timing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Question {questionNumber}</span>
                <span className="text-sm text-muted-foreground">Target: {formatTime(targetTime * 60)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-center py-12">
                <div className="text-8xl font-bold tabular-nums tracking-tighter">{formatTime(currentTime)}</div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => completeQuestion("completed")} className="w-full h-16" variant="default">
                  <Check className="mr-2 h-6 w-6" /> Correct
                </Button>
                <Button onClick={() => completeQuestion("wrong")} className="w-full h-16" variant="destructive">
                  <X className="mr-2 h-6 w-6" /> Wrong
                </Button>
                <Button onClick={() => completeQuestion("passed")} className="w-full h-16" variant="secondary">
                  <Forward className="mr-2 h-6 w-6" /> Pass
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {phase === "result" && (
          <Card>
            <CardHeader>
              <CardTitle>
                Question {questionNumber}{" "}
                {history[history.length - 1]?.status === "passed"
                  ? "Passed"
                  : history[history.length - 1]?.status === "wrong"
                    ? "Wrong"
                    : "Complete"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-8">
                <div className="text-center text-6xl font-bold">
                  <span className={getTimeStatus(currentTime, targetTime * 60, history[history.length - 1]?.status)}>
                    {formatTime(currentTime)}
                  </span>
                </div>
                <div className="mt-4 text-center text-lg text-muted-foreground">
                  Target time was {formatTime(targetTime * 60)}
                </div>
                <div className="mt-2 text-center font-semibold">Marks: {history[history.length - 1]?.marks}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remark">Add a remark (optional)</Label>
                <Textarea
                  id="remark"
                  placeholder="Write any notes or remarks about this question..."
                  value={currentRemark}
                  onChange={(e) => setCurrentRemark(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={nextQuestion} className="w-full h-16">
                Start Next Question
              </Button>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <div key={item.questionNumber} className="space-y-2 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>Question {item.questionNumber}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {item.marks > 0 ? "+" : ""}
                          {item.marks}
                        </span>
                        <span className={getTimeStatus(item.timeSpent, item.targetTime, item.status)}>
                          {formatTime(item.timeSpent)}
                        </span>
                      </div>
                    </div>
                    {item.remark && <p className="text-sm text-muted-foreground border-t pt-2 mt-2">{item.remark}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <footer className="text-center text-sm text-muted-foreground py-4">
          Made with ❤️ by{" "}
          <Link
            href="https://www.shrit.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline hover:text-primary"
          >
            shrit1401
          </Link>
        </footer>
      </div>
    </div>
  )
}

