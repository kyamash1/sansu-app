import { calcScore, formatTime, isBetterRank } from '../scoring'
import { UNLOCK_RANK, getCurrentStage, stageDetail, stageLabel, type Stage } from '../stages'
import type { PlayRecord } from '../storage'
import type { AnswerLog } from './Play'
import { Stamp } from './Stamp'

type Props = {
  stage: Stage
  record: PlayRecord
  answers: AnswerLog[]
  previousBest?: PlayRecord
  unlockedNext: boolean
  onPlay: (stageId: string) => void
  onHome: () => void
  onOpenStamps: () => void
}

const RANK_MESSAGES = {
  S: 'すごすぎる! てんさい!',
  A: 'とっても じょうず!',
  B: 'よく できました!',
  C: 'がんばったね!',
  D: 'つぎも がんばろう!',
} as const

export function Result({
  stage,
  record,
  answers,
  previousBest,
  unlockedNext,
  onPlay,
  onHome,
  onOpenStamps,
}: Props) {
  const { level } = stage
  const score = calcScore(record.correct, record.total, record.timeMs, level.targetSecPerProblem)
  const mistakes = answers.filter((a) => !a.correct)
  const isNewBest =
    !previousBest ||
    isBetterRank(record.rank, previousBest.rank) ||
    (record.rank === previousBest.rank && record.timeMs < previousBest.timeMs)

  const current = getCurrentStage()
  const mustRetry = current?.id === stage.id
  const goNext = current && !mustRetry ? current : undefined

  return (
    <div className="screen result">
      <div className="result-level">
        {stageLabel(stage)}({stageDetail(stage)})おわり!
      </div>

      <div className="result-stamp">
        <Stamp rank={record.rank} size={160} animate />
      </div>
      <div className="result-message">{RANK_MESSAGES[record.rank]}</div>
      {isNewBest && <div className="new-best">★ じこベスト こうしん! ★</div>}

      {unlockedNext && current && (
        <div className="next-banner next-banner-open">
          🎉 {stageLabel(current)}が ひらいたよ!
          <small>{stageDetail(current)}</small>
        </div>
      )}
      {mustRetry && (
        <div className="next-banner next-banner-retry">
          {UNLOCK_RANK}いじょう で つぎの ステージに すすめるよ!
          <small>もういちど チャレンジしてみよう</small>
        </div>
      )}
      {!current && <div className="next-banner next-banner-open">👑 ぜんぶの ステージを クリア!</div>}

      <div className="result-actions">
        {goNext ? (
          <>
            <button className="btn btn-primary btn-big" onClick={() => onPlay(goNext.id)}>
              つぎへ すすむ ▶ {stageLabel(goNext)}
            </button>
            <button className="btn btn-sub" onClick={() => onPlay(stage.id)}>
              もういちど
            </button>
          </>
        ) : (
          <button className="btn btn-primary btn-big" onClick={() => onPlay(stage.id)}>
            もういちど チャレンジ
          </button>
        )}
      </div>

      <div className="result-grid">
        <div className="result-item">
          <div className="result-label">せいかい</div>
          <div className="result-value">
            {record.correct}
            <small>/{record.total}もん</small>
          </div>
          <div className="result-sub">
            {score.accuracy.toFixed(0)}% <Stamp rank={score.accuracyRank} size={28} />
          </div>
        </div>
        <div className="result-item">
          <div className="result-label">タイム</div>
          <div className="result-value">{formatTime(record.timeMs)}</div>
          <div className="result-sub">
            1もん {score.avgSec.toFixed(1)}びょう <Stamp rank={score.speedRank} size={28} />
          </div>
        </div>
      </div>

      {mistakes.length > 0 && (
        <div className="mistakes">
          <div className="mistakes-title">まちがえた もんだい</div>
          <ul>
            {mistakes.map((m, i) => (
              <li key={i}>
                {m.problem.a} + {m.problem.b} = <b>{m.problem.answer}</b>
                <span className="mistake-input">({m.input} って こたえたよ)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="result-actions">
        <button className="btn btn-sub" onClick={onHome}>
          ステージマップに もどる
        </button>
        <button className="btn btn-sub" onClick={onOpenStamps}>
          スタンプを みる
        </button>
      </div>
    </div>
  )
}
