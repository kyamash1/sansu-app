import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { generateProblems, type Problem } from '../levels'
import { formatClock } from '../scoring'
import { playCorrect, playWrong } from '../sound'
import { stageDetail, stageLabel, type Stage } from '../stages'

export type AnswerLog = {
  problem: Problem
  input: string
  correct: boolean
  ms: number
}

type Props = {
  stage: Stage
  onFinish: (answers: AnswerLog[], timeMs: number) => void
  onQuit: () => void
}

const ROW_HEIGHT = 104
const ROWS_BEFORE = 5
const ROWS_AFTER = 5
const MAX_INPUT_LENGTH = 2

type PlayState = {
  problems: Problem[]
  input: string
  answers: AnswerLog[]
  startedAt: number | null
  shownAt: number
  finishedAt: number | null
}

type Action = { type: 'start'; now: number } | { type: 'key'; key: string; now: number }

function submit(state: PlayState, value: string, now: number): PlayState {
  if (value === '') return state
  const problem = state.problems[state.answers.length]
  const log: AnswerLog = {
    problem,
    input: value,
    correct: Number(value) === problem.answer,
    ms: now - state.shownAt,
  }
  const answers = [...state.answers, log]
  return {
    ...state,
    input: '',
    answers,
    shownAt: now,
    finishedAt: answers.length >= state.problems.length ? now : null,
  }
}

function reducer(state: PlayState, action: Action): PlayState {
  if (action.type === 'start') {
    return state.startedAt === null ? { ...state, startedAt: action.now, shownAt: action.now } : state
  }
  if (state.startedAt === null || state.finishedAt !== null) return state

  const { key, now } = action
  if (key === 'del') return { ...state, input: state.input.slice(0, -1) }
  if (key === 'ok') return submit(state, state.input, now)
  if (state.input.length >= MAX_INPUT_LENGTH) return state

  const next = state.input === '0' ? key : state.input + key
  const answer = state.problems[state.answers.length].answer
  // こたえの桁数ぶん入力したら自動で次へ進む
  if (next.length >= String(answer).length) return submit(state, next, now)
  return { ...state, input: next }
}

export function Play({ stage, onFinish, onQuit }: Props) {
  const [state, dispatch] = useReducer(reducer, stage, (s) => ({
    problems: generateProblems(s.level, s.count),
    input: '',
    answers: [],
    startedAt: null,
    shownAt: 0,
    finishedAt: null,
  }))
  const [countdown, setCountdown] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const reported = useRef(false)

  const { problems, input, answers, startedAt, finishedAt } = state
  const playing = countdown === 0
  const total = problems.length
  const index = Math.min(answers.length, total - 1)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => {
      if (countdown === 1) dispatch({ type: 'start', now: performance.now() })
      setCountdown(countdown - 1)
    }, 800)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (startedAt === null || finishedAt !== null) return
    const t = setInterval(() => setElapsed(performance.now() - startedAt), 200)
    return () => clearInterval(t)
  }, [startedAt, finishedAt])

  useEffect(() => {
    if (finishedAt === null || startedAt === null || reported.current) return
    reported.current = true
    onFinish(answers, finishedAt - startedAt)
  }, [finishedAt, startedAt, answers, onFinish])

  useEffect(() => {
    const last = answers[answers.length - 1]
    if (!last) return
    if (last.correct) playCorrect()
    else playWrong()
  }, [answers])

  const press = useCallback((key: string) => dispatch({ type: 'key', key, now: performance.now() }), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
      else if (e.key === 'Enter') press('ok')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [press])

  const handleQuit = () => {
    if (window.confirm('とちゅうで やめますか?(きろくは のこりません)')) onQuit()
  }

  const from = Math.max(0, index - ROWS_BEFORE)
  const to = Math.min(total - 1, index + ROWS_AFTER)
  const rows = []
  for (let i = from; i <= to; i++) {
    const p = problems[i]
    const log = answers[i]
    const isCurrent = i === index && playing
    rows.push(
      <div
        key={i}
        className={`row ${isCurrent ? 'row-current' : ''} ${log ? 'row-done' : ''} ${
          !log && !isCurrent ? 'row-next' : ''
        }`}
        style={{ top: i * ROW_HEIGHT, height: ROW_HEIGHT }}
      >
        <span className="row-no">({i + 1})</span>
        <span className="row-expr">
          {p.a} + {p.b} =
        </span>
        <span className={`row-answer ${isCurrent ? 'row-answer-active' : ''}`}>
          {log ? log.input : isCurrent ? input : ''}
          {isCurrent && <span className="caret" />}
        </span>
        <span className="row-mark">
          {log &&
            (log.correct ? (
              <span className="mark-ok">○</span>
            ) : (
              <span className="mark-ng">
                ✕<small>{p.answer}</small>
              </span>
            ))}
        </span>
      </div>,
    )
  }

  const correctCount = answers.filter((a) => a.correct).length

  return (
    <div className="screen play">
      <header className="play-header">
        <button className="btn btn-small" onClick={handleQuit}>
          やめる
        </button>
        <div className="play-level">
          {stageLabel(stage)} <small>{stageDetail(stage)}</small>
        </div>
        <div className="play-stats">
          <span className="play-clock">⏱ {formatClock(elapsed)}</span>
          <span className="play-progress">
            {Math.min(answers.length + 1, total)}/{total}
          </span>
        </div>
      </header>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${(answers.length / total) * 100}%` }} />
      </div>

      <div className="sheet">
        <div className="sheet-inner" style={{ transform: `translateY(${-index * ROW_HEIGHT}px)` }}>
          {rows}
        </div>
        {!playing && (
          <div className="countdown">
            <div key={countdown} className="countdown-num">
              {countdown}
            </div>
            <div className="countdown-text">よーい…</div>
          </div>
        )}
      </div>

      <div className="play-footer">
        <span className="mark-ok">○</span> {correctCount}
        <span className="mark-ng" style={{ marginLeft: 16 }}>
          ✕
        </span>{' '}
        {answers.length - correctCount}
      </div>

      <div className="keypad">
        {['7', '8', '9', '4', '5', '6', '1', '2', '3', 'del', '0', 'ok'].map((k) => (
          <button
            key={k}
            className={`key ${k === 'ok' ? 'key-ok' : ''} ${k === 'del' ? 'key-del' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault()
              press(k)
            }}
            disabled={!playing}
          >
            {k === 'del' ? 'けす' : k === 'ok' ? 'OK' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
