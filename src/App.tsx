import { useState } from 'react'
import { calcScore } from './scoring'
import { STAGES, findStage, getNextStage, isStageCleared } from './stages'
import { addRecord, getBestRecord, type PlayRecord } from './storage'
import { Home } from './components/Home'
import { Play, type AnswerLog } from './components/Play'
import { Result } from './components/Result'
import { Stamps } from './components/Stamps'

type Screen =
  | { name: 'home' }
  | { name: 'play'; stageId: string; key: number }
  | {
      name: 'result'
      stageId: string
      record: PlayRecord
      answers: AnswerLog[]
      previousBest?: PlayRecord
      unlockedNext: boolean
    }
  | { name: 'stamps'; levelId: string }

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'home' })

  const goHome = () => setScreen({ name: 'home' })
  const startPlay = (stageId: string) => setScreen({ name: 'play', stageId, key: Date.now() })
  const openStamps = (levelId: string) => setScreen({ name: 'stamps', levelId })

  switch (screen.name) {
    case 'home':
      return <Home onStart={startPlay} onOpenStamps={openStamps} />

    case 'play': {
      const stage = findStage(screen.stageId) ?? STAGES[0]
      const { level } = stage
      return (
        <Play
          key={screen.key}
          stage={stage}
          onQuit={goHome}
          onFinish={(answers, timeMs) => {
            const correct = answers.filter((a) => a.correct).length
            const { rank } = calcScore(correct, answers.length, timeMs, level.targetSecPerProblem)
            const previousBest = getBestRecord(stage.id)
            const wasCleared = isStageCleared(stage)
            const record = addRecord({
              levelId: level.id,
              stageId: stage.id,
              playedAt: Date.now(),
              total: answers.length,
              correct,
              timeMs,
              rank,
            })
            const unlockedNext = !wasCleared && isStageCleared(stage) && !!getNextStage(stage)
            setScreen({
              name: 'result',
              stageId: stage.id,
              record,
              answers,
              previousBest,
              unlockedNext,
            })
          }}
        />
      )
    }

    case 'result': {
      const stage = findStage(screen.stageId) ?? STAGES[0]
      return (
        <Result
          stage={stage}
          record={screen.record}
          answers={screen.answers}
          previousBest={screen.previousBest}
          unlockedNext={screen.unlockedNext}
          onPlay={startPlay}
          onHome={goHome}
          onOpenStamps={() => openStamps(stage.level.id)}
        />
      )
    }

    case 'stamps':
      return <Stamps initialLevelId={screen.levelId} onBack={goHome} />
  }
}
