import { useState } from 'react'
import { LEVELS, findLevel } from '../levels'
import { RANKS, formatTime, rankCriteria } from '../scoring'
import { STAGES, UNLOCK_RANK, findStage, stageLabel } from '../stages'
import { clearRecords, countStamps, getBestRecord, getRecords } from '../storage'
import { Stamp } from './Stamp'

type Props = {
  initialLevelId: string
  onBack: () => void
}

const CARD_SLOTS = 20

function formatDate(ts: number) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function Stamps({ initialLevelId, onBack }: Props) {
  const [levelId, setLevelId] = useState(initialLevelId)
  const [, setVersion] = useState(0)
  const level = findLevel(levelId) ?? LEVELS[0]
  const records = getRecords({ levelId: level.id })
  const counts = countStamps(level.id)

  // スタンプカードは20こで1まい。いっぱいになったら つぎのカードへ
  const slotCount = Math.max(CARD_SLOTS, Math.ceil((records.length + 1) / CARD_SLOTS) * CARD_SLOTS)
  const slots = Array.from({ length: slotCount }, (_, i) => records[i])

  const handleClear = () => {
    if (window.confirm('ぜんぶの レベルの きろくと スタンプを けします。よろしいですか?')) {
      clearRecords()
      setVersion((v) => v + 1)
    }
  }

  return (
    <div className="screen stamps">
      <header className="stamps-header">
        <button className="btn btn-small" onClick={onBack}>
          もどる
        </button>
        <h2>スタンプカード</h2>
        <span />
      </header>

      <section className="zukan">
        <div className="zukan-title">さいきょう ずかん</div>
        <div className="zukan-grid">
          {STAGES.map((stage) => {
            const best = getBestRecord(stage.id)
            return (
              <div key={stage.id} className="zukan-item">
                {best ? (
                  <Stamp rank={best.rank} size={72} animal={stage.animal} label={formatTime(best.timeMs)} />
                ) : (
                  <div className="zukan-unknown">
                    <img src={stage.animal.image} alt="" draggable={false} />
                    <span>?</span>
                  </div>
                )}
                <span className="zukan-name">{best ? stage.animal.name : stageLabel(stage)}</span>
              </div>
            )
          })}
        </div>
      </section>

      <div className="tabs">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            className={`tab ${l.id === level.id ? 'tab-active' : ''}`}
            onClick={() => setLevelId(l.id)}
          >
            {l.name}
          </button>
        ))}
      </div>

      <div className="stamp-summary">
        {RANKS.map((r) => (
          <div key={r} className="stamp-summary-item">
            <Stamp rank={r} size={40} />
            <span>×{counts[r]}</span>
          </div>
        ))}
      </div>

      <div className="stamp-card">
        {slots.map((rec, i) => (
          <div key={i} className="stamp-slot">
            {rec ? (
              <>
                <Stamp
                  rank={rec.rank}
                  size={58}
                  label={formatTime(rec.timeMs)}
                  animal={findStage(rec.stageId)?.animal}
                />
                <span className="stamp-date">
                  {formatDate(rec.playedAt)}・{rec.total}もん
                </span>
              </>
            ) : (
              <span className="stamp-slot-no">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      <details className="criteria">
        <summary>ランクの きじゅん(おうちの かたへ)</summary>
        <p>
          正答率とタイムをそれぞれ評価し、低いほうのランクになります。
          レベル1〜4 はそれぞれ 30・50・70・100問 で、各レベルの中で問題の種類ごとにステージが進みます。
          {UNLOCK_RANK} 以上でクリアすると次のステージが解放されます。
        </p>
        <table>
          <thead>
            <tr>
              <th>ランク</th>
              <th>正答率</th>
              <th>1問あたり</th>
              <th>100問なら</th>
            </tr>
          </thead>
          <tbody>
            {rankCriteria(level.targetSecPerProblem).map((c) => (
              <tr key={c.rank}>
                <td>{c.rank}</td>
                <td>{c.accuracy}% 以上</td>
                <td>{c.secPerProblem.toFixed(1)}秒 以内</td>
                <td>{formatTime(c.secPerProblem * 100 * 1000)} 以内</td>
              </tr>
            ))}
            <tr>
              <td>D</td>
              <td colSpan={3}>上記以外</td>
            </tr>
          </tbody>
        </table>

        {records.length > 0 && (
          <>
            <div className="history-title">さいきんの きろく</div>
            <table>
              <thead>
                <tr>
                  <th>日付</th>
                  <th>ランク</th>
                  <th>正解</th>
                  <th>タイム</th>
                </tr>
              </thead>
              <tbody>
                {[...records]
                  .reverse()
                  .slice(0, 20)
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{new Date(r.playedAt).toLocaleString('ja-JP')}</td>
                      <td>{r.rank}</td>
                      <td>
                        {r.correct}/{r.total}
                      </td>
                      <td>{formatTime(r.timeMs)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        <button className="btn btn-danger" onClick={handleClear}>
          きろくを ぜんぶ けす
        </button>
      </details>
    </div>
  )
}
