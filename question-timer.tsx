"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, Forward, Clock, Brain, Maximize2, Minimize2 } from "lucide-react"
import Link from "next/link"

interface QuestionTime {
  questionNumber: number
  timeSpent: number
  targetTime: number
  status: "completed" | "passed"
}

export default function QuestionTimer() {
  const [phase, setPhase] = useState<"setup" | "timing" | "result">("setup")
  const [targetTime, setTargetTime] = useState<number>(5)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const [questionNumber, setQuestionNumber] = useState<number>(1)
  const [history, setHistory] = useState<QuestionTime[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const startQuestion = () => {
    if (phase === "setup") {
      setPhase("timing")
    }
    setCurrentTime(0)
    setIsRunning(true)
    // Automatically go fullscreen when starting
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    }
  }

  const completeQuestion = (status: "completed" | "passed") => {
    setIsRunning(false)
    setPhase("result")
    setHistory((prev) => [
      ...prev,
      {
        questionNumber,
        timeSpent: currentTime,
        targetTime: targetTime * 60,
        status,
      },
    ])
  }

  const nextQuestion = () => {
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
    return `${hours}h ${minutes}m`
  }

  const getTotalStudyTime = () => {
    return history.reduce((total, item) => total + item.timeSpent, 0)
  }

  const getTimeStatus = (spent: number, target: number, status: "completed" | "passed") => {
    if (status === "passed") return "text-blue-500"
    if (spent <= target) return "text-green-500"
    if (spent <= target * 1.5) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Study Timer</h1>
          </div>
          {phase === "timing" && (
            <Button variant="outline" size="icon" onClick={toggleFullscreen} className="rounded-full">
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="font-semibold">Total Study Time</span>
              </div>
              <span className="text-xl font-bold">{formatTotalTime(getTotalStudyTime())}</span>
            </div>
          </CardContent>
        </Card>

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
                  className="text-lg"
                />
              </div>
              <Button onClick={startQuestion} className="w-full text-lg">
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
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => completeQuestion("completed")} className="w-full h-16 text-lg" variant="default">
                  <Check className="mr-2 h-6 w-6" /> Complete
                </Button>
                <Button onClick={() => completeQuestion("passed")} className="w-full h-16 text-lg" variant="secondary">
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
                Question {questionNumber} {history[history.length - 1]?.status === "passed" ? "Passed" : "Complete"}
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
              </div>
              <Button onClick={nextQuestion} className="w-full h-16 text-lg">
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
                  <div
                    key={item.questionNumber}
                    className="flex items-center justify-between rounded-lg border p-4 text-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span>Question {item.questionNumber}</span>
                      {item.status === "passed" && <Forward className="h-5 w-5 text-blue-500" />}
                    </div>
                    <span className={getTimeStatus(item.timeSpent, item.targetTime, item.status)}>
                      {formatTime(item.timeSpent)}
                    </span>
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

