import { useEffect, useState } from 'react'
import { getHint, type Hint as HintData, type HintVisual } from '../hints'
import { formatProblem, type Problem } from '../levels'

type Props = {
  problem: Problem
  onClose: () => void
}

function UnitBlocks({ count, tone, dim }: { count: number; tone: string; dim?: boolean }) {
  const n = Math.max(0, Math.min(count, 20))
  return (
    <div className={`hint-blocks ${dim ? 'hint-blocks-dim' : ''}`} aria-hidden>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={`hint-block hint-block-${tone}`} />
      ))}
      {count > 20 && <span className="hint-blocks-more">+{count - 20}</span>}
    </div>
  )
}

function TenRod({ tone }: { tone: string }) {
  return <span className={`hint-ten hint-ten-${tone}`} aria-hidden />
}

function Make10Visual({ visual }: { visual: Extract<HintVisual, { type: 'make10' }> }) {
  const { a, toTen, remain, tenValue } = visual
  return (
    <div className="hint-visual">
      <div className="hint-row">
        <span className="hint-row-label">{a}</span>
        <UnitBlocks count={a} tone="a" />
      </div>
      <div className="hint-row">
        <span className="hint-row-label">+{toTen + remain}</span>
        <div className="hint-split">
          <div className="hint-split-part">
            <UnitBlocks count={toTen} tone="fill" />
            <span className="hint-caption">10にする</span>
          </div>
          {remain > 0 && (
            <div className="hint-split-part">
              <UnitBlocks count={remain} tone="b" />
              <span className="hint-caption">のこり {remain}</span>
            </div>
          )}
        </div>
      </div>
      <div className="hint-arrow">↓</div>
      <div className="hint-result-eq">
        <span className="hint-ten-badge">{tenValue}</span>
        {remain > 0 && (
          <>
            <span> + </span>
            <span className="hint-remain-badge">{remain}</span>
          </>
        )}
      </div>
    </div>
  )
}

function BorrowVisual({ visual }: { visual: Extract<HintVisual, { type: 'borrow' }> }) {
  const { a, b, ones, fromTen } = visual
  return (
    <div className="hint-visual">
      <div className="hint-row">
        <span className="hint-row-label">{a}</span>
        <div className="hint-split">
          <div className="hint-split-part">
            <TenRod tone="a" />
            <span className="hint-caption">10</span>
          </div>
          {ones > 0 && (
            <div className="hint-split-part">
              <UnitBlocks count={ones} tone="a" />
              <span className="hint-caption">{ones}</span>
            </div>
          )}
        </div>
      </div>
      <div className="hint-row">
        <span className="hint-row-label">−{b}</span>
        <div className="hint-split-part">
          <UnitBlocks count={b} tone="gone" />
          <span className="hint-caption">10から ひく</span>
        </div>
      </div>
      <div className="hint-arrow">↓</div>
      <div className="hint-result-eq">
        <span className="hint-remain-badge">{fromTen}</span>
        {ones > 0 && (
          <>
            <span> + </span>
            <span className="hint-ten-badge">{ones}</span>
          </>
        )}
      </div>
    </div>
  )
}

function BlocksVisual({ visual }: { visual: Extract<HintVisual, { type: 'blocks' }> }) {
  return (
    <div className="hint-visual">
      {visual.groups.map((g, i) => (
        <div className="hint-row" key={i}>
          {g.label && <span className="hint-row-label">{g.label}</span>}
          <UnitBlocks count={g.count} tone={g.tone} />
        </div>
      ))}
    </div>
  )
}

function MultiplyVisual({ visual }: { visual: Extract<HintVisual, { type: 'multiply' }> }) {
  const { a, b } = visual
  const rows = Math.min(b, 9)
  return (
    <div className="hint-visual hint-visual-multiply">
      {Array.from({ length: rows }, (_, i) => (
        <div className="hint-row" key={i}>
          <span className="hint-row-label">{i + 1}</span>
          <UnitBlocks count={Math.min(a, 12)} tone={i === b - 1 ? 'fill' : 'a'} />
          <span className="hint-mul-sum">= {a * (i + 1)}</span>
        </div>
      ))}
      {b > 9 && <div className="hint-caption">… {b} こまで</div>}
    </div>
  )
}

function PlaceVisual({ visual }: { visual: Extract<HintVisual, { type: 'place' }> }) {
  const op = visual.operator === '+' ? '+' : '−'
  return (
    <div className="hint-visual hint-place">
      <div className="hint-place-grid">
        <div />
        <div className="hint-place-h">じゅう</div>
        <div className="hint-place-h">いち</div>
        <div className="hint-place-label"> </div>
        <div className="hint-place-cell hint-block-a">{visual.aTens}</div>
        <div className="hint-place-cell hint-block-a">{visual.aOnes}</div>
        <div className="hint-place-label">{op}</div>
        <div className="hint-place-cell hint-block-b">{visual.bTens}</div>
        <div className="hint-place-cell hint-block-b">{visual.bOnes}</div>
        <div className="hint-place-label">=</div>
        <div className="hint-place-cell hint-block-fill">{visual.sumTens}</div>
        <div className="hint-place-cell hint-block-fill">{visual.sumOnes}</div>
      </div>
      {visual.carry != null && visual.carry > 0 && (
        <div className="hint-caption">いちのくらいから くりあがり +{visual.carry}</div>
      )}
      {visual.borrow && <div className="hint-caption">じゅうのくらいから 1かりたよ</div>}
    </div>
  )
}

function HintVisualView({ visual }: { visual: HintVisual }) {
  switch (visual.type) {
    case 'make10':
      return <Make10Visual visual={visual} />
    case 'borrow':
      return <BorrowVisual visual={visual} />
    case 'blocks':
      return <BlocksVisual visual={visual} />
    case 'multiply':
      return <MultiplyVisual visual={visual} />
    case 'place':
      return <PlaceVisual visual={visual} />
  }
}

export function HintPanel({ problem, onClose }: Props) {
  const hint: HintData = getHint(problem)
  const [step, setStep] = useState(0)
  const last = step >= hint.steps.length - 1
  const showVisual = step >= 1 && hint.visual
  const showRewritten = last && hint.rewritten

  useEffect(() => {
    setStep(0)
  }, [problem])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="hint-overlay" role="dialog" aria-modal="true" aria-label="ヒント">
      <div className="hint-panel">
        <header className="hint-header">
          <div className="hint-title">ヒント</div>
          <div className="hint-problem">{formatProblem(problem)} = ?</div>
          <button type="button" className="btn btn-small hint-close" onClick={onClose}>
            とじる
          </button>
        </header>

        <div className="hint-steps" aria-live="polite">
          {hint.steps.slice(0, step + 1).map((text, i) => (
            <div key={i} className={`hint-step ${i === step ? 'hint-step-active' : ''}`}>
              <span className="hint-step-no">{i + 1}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {showVisual && <HintVisualView visual={hint.visual!} />}

        {showRewritten && (
          <div className="hint-rewritten">
            つまり <strong>{hint.rewritten}</strong>
            {hint.rewritten !== String(problem.answer) && (
              <>
                {' '}
                = <strong>{problem.answer}</strong>
              </>
            )}
          </div>
        )}

        <div className="hint-actions">
          {!last ? (
            <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
              つぎのヒント ▶
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onClose}>
              わかった!
            </button>
          )}
        </div>

        <div className="hint-progress">
          {hint.steps.map((_, i) => (
            <span key={i} className={`hint-dot ${i <= step ? 'hint-dot-on' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
