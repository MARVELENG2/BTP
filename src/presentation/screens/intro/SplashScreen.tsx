import Logo from '@/presentation/components/Logo'
import './SplashScreen.css'

export default function SplashScreen() {
  return (
    <div className="splash">
      <div className="splash__glow" aria-hidden="true" />
      <div className="splash__logo">
        <Logo size={160} />
      </div>
    </div>
  )
}