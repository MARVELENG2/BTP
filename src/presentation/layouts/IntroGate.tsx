import { useEffect, useState, type ReactNode } from 'react'
import { hasSeenIntro, markIntroSeen } from '@/application/intro/introState'
import SplashScreen from '@/presentation/screens/intro/SplashScreen'
import WelcomeScreen from '@/presentation/screens/intro/WelcomeScreen'
import { appConfig } from '@/shared/config/appConfig'

type Stage = 'splash' | 'welcome' | 'done'

interface IntroGateProps {
  children: ReactNode
}

export default function IntroGate({ children }: IntroGateProps) {
  const [stage, setStage] = useState<Stage>(() => (hasSeenIntro() ? 'done' : 'splash'))

  useEffect(() => {
    if (stage !== 'splash') return
    const id = setTimeout(() => setStage('welcome'), appConfig.splashDurationMs)
    return () => clearTimeout(id)
  }, [stage])

  if (stage === 'splash') return <SplashScreen />

  if (stage === 'welcome') {
    return (
      <WelcomeScreen
        onEnter={() => {
          markIntroSeen()
          setStage('done')
        }}
      />
    )
  }

  return <>{children}</>
}