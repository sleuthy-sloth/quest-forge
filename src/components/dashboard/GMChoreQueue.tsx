'use client'

import { useChores } from '@/hooks/useChores'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  householdId: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const secs = Math.floor((now - then) / 1000)
  if (secs < 60) return 'Just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return `${Math.floor(secs / 86400)}d ago`
}

function difficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'epic':   return '#aa44ff'
    case 'hard':   return '#e05555'
    case 'medium': return '#e8a020'
    default:       return '#5aab6e'
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GMChoreQueue({ householdId }: Props) {
  const {
    pendingCompletions,
    loading,
    error,
    processingIds,
    verifyChore,
    refresh,
  } = useChores(householdId)

  const pendingCount = pendingCompletions.length

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ padding: '32px 16px' }}>
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#c9a84c',
            letterSpacing: '2px',
            textAlign: 'center',
          }}
        >
          Loading pending quests…
        </div>
      </div>
    )
  }

  // ── Empty state ─────────────────────────────────────────────────────────

  if (pendingCount === 0 && !error) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>
          ✨
        </div>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            color: '#c9a84c',
            marginBottom: '6px',
          }}
        >
          All caught up!
        </div>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: '#7a6a44',
          }}
        >
          No pending verifications. New completions will appear here instantly.
        </div>
      </div>
    )
  }

  // ── Error banner ────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            color: '#e05555',
            marginBottom: '12px',
          }}
        >
          {error}
        </div>
        <button
          onClick={refresh}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '7px',
            color: '#f0e6c8',
            background: 'linear-gradient(135deg,#c43a00,#8b1e00)',
            border: '1px solid rgba(196,58,0,0.5)',
            borderRadius: '3px',
            padding: '10px 16px',
            cursor: 'pointer',
          }}
        >
          RETRY
        </button>
      </div>
    )
  }

  // ── Queue ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '16px',
              color: '#f0e6c8',
              margin: 0,
            }}
          >
            Pending Verifications
          </h2>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '7px',
              color: '#c43a00',
              background: 'rgba(196,58,0,0.15)',
              border: '1px solid rgba(196,58,0,0.35)',
              borderRadius: '3px',
              padding: '2px 8px',
            }}
          >
            {pendingCount}
          </span>
        </div>
        <button
          onClick={refresh}
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '6px',
            color: '#c9a84c',
            background: 'transparent',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '3px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          🔄 REFRESH
        </button>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block" style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-heading)',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid rgba(201,168,76,0.15)',
              }}
            >
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: '0.65rem',
                  color: '#7a6a44',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                PLAYER
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'left',
                  fontSize: '0.65rem',
                  color: '#7a6a44',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                QUEST
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  color: '#7a6a44',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                REWARD
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  color: '#7a6a44',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                WHEN
              </th>
              <th
                style={{
                  padding: '8px 10px',
                  textAlign: 'center',
                  fontSize: '0.65rem',
                  color: '#7a6a44',
                  fontWeight: 400,
                  letterSpacing: '0.5px',
                }}
              >
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {pendingCompletions.map(completion => (
              <VerificationRow
                key={completion.completionId}
                completion={completion}
                isProcessing={processingIds.has(completion.completionId)}
                onApprove={() => verifyChore(completion.completionId, true)}
                onReject={() => verifyChore(completion.completionId, false)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pendingCompletions.map(completion => (
          <VerificationCard
            key={completion.completionId}
            completion={completion}
            isProcessing={processingIds.has(completion.completionId)}
            onApprove={() => verifyChore(completion.completionId, true)}
            onReject={() => verifyChore(completion.completionId, false)}
          />
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop row
// ---------------------------------------------------------------------------

function VerificationRow({
  completion,
  isProcessing,
  onApprove,
  onReject,
}: {
  completion: ReturnType<typeof useChores>['pendingCompletions'][number]
  isProcessing: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <tr
      style={{
        borderBottom: '1px solid rgba(201,168,76,0.07)',
        transition: 'opacity 0.2s',
        opacity: isProcessing ? 0.5 : 1,
      }}
    >
      {/* Player */}
      <td style={{ padding: '10px', verticalAlign: 'top' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '0.8rem',
            color: '#c9a84c',
          }}
        >
          {completion.playerName}
        </div>
      </td>

      {/* Quest */}
      <td style={{ padding: '10px', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.8rem',
              color: '#f0e6c8',
            }}
          >
            {completion.choreTitle}
          </span>
          {completion.questFlavorText && (
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                fontSize: '0.7rem',
                color: '#7a6a44',
              }}
            >
              {completion.questFlavorText}
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.55rem',
              color: difficultyColor(completion.difficulty),
              background: `${difficultyColor(completion.difficulty)}18`,
              borderRadius: '2px',
              padding: '1px 6px',
              display: 'inline-block',
              width: 'fit-content',
              letterSpacing: '0.5px',
            }}
          >
            {completion.difficulty.toUpperCase()}
          </span>
        </div>
      </td>

      {/* Reward */}
      <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.7rem',
              color: '#c9a84c',
            }}
          >
            ⚡ {completion.xpReward} XP
          </span>
          {completion.goldReward > 0 && (
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.65rem',
                color: '#ffd700',
              }}
            >
              💰 {completion.goldReward}
            </span>
          )}
        </div>
      </td>

      {/* When */}
      <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'top' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            color: '#7a6a44',
          }}
        >
          {relativeTime(completion.completedAt)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'top' }}>
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
          <button
            onClick={onApprove}
            disabled={isProcessing}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.6rem',
              color: '#f0e6c8',
              background: isProcessing
                ? 'rgba(46,184,92,0.15)'
                : 'linear-gradient(135deg,#1e7a3a,#0f4a20)',
              border: '1px solid rgba(46,184,92,0.5)',
              borderRadius: '3px',
              padding: '6px 12px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              minWidth: '72px',
            }}
          >
            {isProcessing ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Spinner />
              </span>
            ) : (
              '✓ APPROVE'
            )}
          </button>
          <button
            onClick={onReject}
            disabled={isProcessing}
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '0.6rem',
              color: '#f0e6c8',
              background: isProcessing
                ? 'rgba(224,85,85,0.15)'
                : 'linear-gradient(135deg,#7a2020,#4a1010)',
              border: '1px solid rgba(224,85,85,0.5)',
              borderRadius: '3px',
              padding: '6px 12px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              minWidth: '72px',
            }}
          >
            ✕ REJECT
          </button>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Mobile card
// ---------------------------------------------------------------------------

function VerificationCard({
  completion,
  isProcessing,
  onApprove,
  onReject,
}: {
  completion: ReturnType<typeof useChores>['pendingCompletions'][number]
  isProcessing: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg,#0d0f1c,#070910)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '4px',
        padding: '12px',
        opacity: isProcessing ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {/* Player name + timestamp */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '14px',
            color: '#c9a84c',
          }}
        >
          {completion.playerName}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: '#7a6a44',
          }}
        >
          {relativeTime(completion.completedAt)}
        </span>
      </div>

      {/* Chore title + difficulty */}
      <div style={{ marginBottom: '8px' }}>
        <div
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '13px',
            color: '#f0e6c8',
            marginBottom: '4px',
          }}
        >
          {completion.choreTitle}
        </div>
        {completion.questFlavorText && (
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontStyle: 'italic',
              fontSize: '11px',
              color: '#7a6a44',
              marginBottom: '4px',
            }}
          >
            {completion.questFlavorText}
          </div>
        )}
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '9px',
            color: difficultyColor(completion.difficulty),
            background: `${difficultyColor(completion.difficulty)}18`,
            borderRadius: '2px',
            padding: '1px 6px',
            letterSpacing: '0.5px',
          }}
        >
          {completion.difficulty.toUpperCase()}
        </span>
      </div>

      {/* Rewards */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <span
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: '#c9a84c',
          }}
        >
          ⚡ {completion.xpReward} XP
        </span>
        {completion.goldReward > 0 && (
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: '#ffd700',
            }}
          >
            💰 {completion.goldReward}
          </span>
        )}
      </div>

      {/* Action buttons — full width on mobile */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onApprove}
          disabled={isProcessing}
          style={{
            flex: 1,
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: '#f0e6c8',
            background: isProcessing
              ? 'rgba(46,184,92,0.15)'
              : 'linear-gradient(135deg,#1e7a3a,#0f4a20)',
            border: '1px solid rgba(46,184,92,0.5)',
            borderRadius: '3px',
            padding: '10px 0',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            minHeight: '44px',
          }}
        >
          {isProcessing ? <Spinner /> : '✓ APPROVE'}
        </button>
        <button
          onClick={onReject}
          disabled={isProcessing}
          style={{
            flex: 1,
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: '#f0e6c8',
            background: isProcessing
              ? 'rgba(224,85,85,0.15)'
              : 'linear-gradient(135deg,#7a2020,#4a1010)',
            border: '1px solid rgba(224,85,85,0.5)',
            borderRadius: '3px',
            padding: '10px 0',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            minHeight: '44px',
          }}
        >
          ✕ REJECT
        </button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tiny inline spinner
// ---------------------------------------------------------------------------

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.2)',
        borderTopColor: '#fff',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  )
}
