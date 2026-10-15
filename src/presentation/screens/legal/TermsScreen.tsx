import { appConfig } from '@/shared/config/appConfig'
import './LegalScreen.css'

export default function TermsScreen() {
  return (
    <article className="legal">
      <h1>Terms of Use</h1>
      <p className="legal__updated">Last updated: {appConfig.legalLastUpdated}</p>

      <h2>Using the app</h2>
      <p>
        {appConfig.appName} is a reading community. You need an account to read, and you are
        responsible for keeping your login details safe.
      </p>

      <h2>Weekly reading</h2>
      <p>
        Chapters are released on a weekly schedule set by the admin. You can only read chapters
        that have been unlocked.
      </p>

      <h2>Books and copyright</h2>
      <p>
        Books in the app are shared for personal reading within the community. Please do not copy,
        screenshot for sharing, or redistribute the content.
      </p>

      <h2>Respectful use</h2>
      <p>
        Do not misuse the app, try to bypass the weekly limits, or interfere with other readers'
        experience. We may suspend accounts that break these rules.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.
      </p>
    </article>
  )
}