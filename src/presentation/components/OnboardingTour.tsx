import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeTour, hasSeenTour } from '@/application/onboarding/tour'
import { useAuth } from '@/presentation/context/useAuth'
import './OnboardingTour.css'

function StepIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="44"
      height="44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

const STEPS = [
  {
    title: 'Read a little each week',
    text: "Every week, new chapters unlock. Open a book, read a chapter to the end, and it's marked as read.",
    icon: (
      <StepIcon>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </StepIcon>
    ),
  },
  {
    title: 'Keep your streak going',
    text: 'Finish a chapter every week to build a streak. Every 4 weeks in a row earns a freeze that covers a missed week, and long streaks earn badges.',
    icon: (
      <StepIcon>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </StepIcon>
    ),
  },
  {
    title: 'Talk about it',
    text: 'Join the WhatsApp group to discuss each week with everyone. Turn on notifications so you never miss an unlock, and download chapters to read offline.',
    icon: (
      <StepIcon>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </StepIcon>
    ),
  },
]

export default function OnboardingTour() {
  const { profile, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [replay, setReplay] = useState(false)
  const [finishedFor, setFinishedFor] = useState<string | null>(null)

  // Settings can ask for the tour to be shown again.
  useEffect(() => {
    const onReplay = () => {
      setStep(0)
      setReplay(true)
    }
    window.addEventListener('btp:show-tour', onReplay)
    return () => window.removeEventListener('btp:show-tour', onReplay)
  }, [])

  if (loading || !profile) return null

  const open = replay || (finishedFor !== profile.id && !hasSeenTour(profile.id))
  if (!open) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const finish = () => {
    completeTour(profile.id)
    setFinishedFor(profile.id)
    setReplay(false)
    setStep(0)
  }

  const next = () => {
    if (!isLast) {
      setStep(step + 1)
      return
    }
    finish()
    navigate('/library')
  }

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-label="How the app works">
      <div className="tour__card">
        <button type="button" className="tour__skip" onClick={finish}>
          Skip
        </button>

        <div className="tour__icon">{current.icon}</div>
        <h2>{current.title}</h2>
        <p>{current.text}</p>

        <div className="tour__dots" aria-hidden="true">
          {STEPS.map((item, index) => (
            <span key={item.title} className={index === step ? 'tour__dot tour__dot--on' : 'tour__dot'} />
          ))}
        </div>

        <div className="tour__actions">
          {step > 0 ? (
            <button type="button" className="tour__back" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="tour__next" onClick={next}>
            {isLast ? 'Start reading' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}