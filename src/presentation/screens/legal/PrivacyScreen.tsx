import { appConfig } from '@/shared/config/appConfig'
import './LegalScreen.css'

export default function PrivacyScreen() {
  return (
    <article className="legal">
      <h1>Privacy Policy</h1>
      <p className="legal__updated">Last updated: {appConfig.legalLastUpdated}</p>

      <h2>What we collect</h2>
      <p>
        When you create an account we collect your name, email address, and the gender you choose
        (used only to offer you suitable avatars). While you use the app we store your reading
        progress, streaks, badges, and reading settings such as font and page color.
      </p>

      <h2>How we use it</h2>
      <p>
        We use this information to run your account, remember where you stopped reading, unlock
        chapters on schedule, and send reminders you have agreed to receive. We do not sell your
        personal information.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        We use essential storage to keep you signed in, remember your settings, and keep downloaded
        chapters available offline. Optional cookies, such as analytics, are only used if you
        choose "Accept all" in the cookie banner.
      </p>

      <h2>Sharing</h2>
      <p>
        We use trusted service providers to host the app and manage accounts. They only handle your
        data to provide those services to us.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct, or delete your personal data at any time by contacting us at{' '}
        <a href={`mailto:${appConfig.contactEmail}`}>{appConfig.contactEmail}</a>.
      </p>

      <h2>Changes</h2>
      <p>If we change this policy we will update the date above.</p>
    </article>
  )
}