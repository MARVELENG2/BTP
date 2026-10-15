import Logo from '@/presentation/components/Logo'
import { appConfig } from '@/shared/config/appConfig'
import './WelcomeScreen.css'

interface WelcomeScreenProps {
  onEnter: () => void
}

export default function WelcomeScreen({ onEnter }: WelcomeScreenProps) {
  return (
    <div className="welcome">
      <div className="welcome__logo">
        <Logo size={110} />
      </div>
      <h1 className="welcome__name">{appConfig.appName.toUpperCase()}</h1>
      <button type="button" className="welcome__button" onClick={onEnter}>
        Enter the library
      </button>
    </div>
  )
}