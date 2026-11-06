import { Fragment, useEffect, useRef } from 'react'
import { formatTime } from '../scoring'
import { STAGES, UNLOCK_RANK, getStageStatuses, levelLabel, stageDetail, stageLabel } from '../stages'
import { getBestRecord } from '../storage'
import { Stamp } from './Stamp'

type Props = {
  onStart: (stageId: string) => void
  onOpenStamps: (levelId: string) => void
}

export function Home({ onStart, onOpenStamps }: Props) {
  const statuses = getStageStatuses()
  const currentIndex = statuses.indexOf('current')
  const current = currentIndex === -1 ? undefined : STAGES[currentIndex]
  const clearedCount = statuses.filter((s) => s === 'cleared').length
  const currentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' })
  }, [])

  return (
    <div className="screen home">
      <header className="home-header">
        <h1>たしざん れんしゅう</h1>
        <div className="map-progress">
          <div className="map-progress-bar">
            <div
              className="map-progress-fill"
              style={{ width: `${(clearedCount / STAGES.length) * 100}%` }}
            />
          </div>
          <span>
            {clearedCount}/{STAGES.length} クリア
          </span>
          <button className="btn btn-small" onClick={() => onOpenStamps((current ?? STAGES[0]).level.id)}>
            スタンプ
          </button>
        </div>
      </header>

      <section className="next-card">
        {current ? (
          <>
            <div className="next-card-label">つぎは これ!</div>
            <div className="next-card-title">
              {stageLabel(current)}
              <small>{stageDetail(current)}</small>
            </div>
            <div className="next-card-desc">{current.level.description}</div>
            <button className="btn btn-primary btn-big" onClick={() => onStart(current.id)}>
              はじめる ▶
            </button>
            <div className="next-card-hint">{UNLOCK_RANK}いじょう で つぎの ステージが ひらくよ</div>
          </>
        ) : (
          <div className="next-card-title">👑 ぜんぶ クリア! すごい!</div>
        )}
      </section>

      <div className="map">
        {STAGES.map((stage, i) => {
          const status = statuses[i]
          const best = getBestRecord(stage.id)
          const isLevelStart = i === 0 || STAGES[i - 1].count !== stage.count
          const reached = status !== 'locked'
          const nextReached = i < STAGES.length - 1 && statuses[i + 1] !== 'locked'
          return (
            <Fragment key={stage.id}>
              {isLevelStart && (
                <div className="map-level-wrap">
                  {i > 0 && <div className={`map-path map-path-full ${reached ? 'map-path-done' : ''}`} />}
                  <div className="map-level">
                    <div>
                      <div className="map-level-name">{levelLabel(stage.count)}</div>
                      <div className="map-level-desc">{stage.count}もん</div>
                    </div>
                  </div>
                </div>
              )}
              <div
                ref={status === 'current' ? currentRef : undefined}
                className={`map-row map-row-${status}`}
              >
                {i > 0 && <div className={`map-path map-path-top ${reached ? 'map-path-done' : ''}`} />}
                {i < STAGES.length - 1 && (
                  <div className={`map-path map-path-bottom ${nextReached ? 'map-path-done' : ''}`} />
                )}
                <div className="map-best">
                  {best && (
                    <Stamp rank={best.rank} size={80} label={formatTime(best.timeMs)} animal={stage.animal} />
                  )}
                </div>
                <button
                  className="map-node"
                  disabled={status === 'locked'}
                  onClick={() => onStart(stage.id)}
                  aria-label={`${stageLabel(stage)} ${stageDetail(stage)}`}
                >
                  {status === 'locked' ? '🔒' : status === 'cleared' ? '★' : stage.index + 1}
                </button>
                <div className="map-info">
                  <div className="map-count">{stage.level.name}</div>
                  <div className="map-status">
                    {status === 'current' && <span className="map-here">つぎは ここ!</span>}
                    {status === 'cleared' && best && `ベスト ${formatTime(best.timeMs)}`}
                    {status === 'locked' && stageLabel(stage)}
                  </div>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
