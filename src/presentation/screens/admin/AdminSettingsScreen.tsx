import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  loadReminderSettings,
  loadWhatsAppSetting,
  saveReminderSettings,
  saveWhatsAppLink,
} from '@/application/settings/appSettings'
import type { ReminderSettings } from '@/domain/rules/reminderSettings'
import ProgressButton from '@/presentation/components/admin/ProgressButton'
import '@/presentation/components/admin/ChapterAdmin.css'

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function WhatsAppForm({ initial }: { initial: string }) {
  const [link, setLink] = useState(initial)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setErrors([])
    setSaved(false)

    const result = await saveWhatsAppLink(link)
    if (result.ok) setSaved(true)
    else setErrors(result.errors)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="chapter-form__form">
      <label>
        WhatsApp group link
        <input
          type="text"
          inputMode="url"
          value={link}
          onChange={(event) => setLink(event.target.value)}
          placeholder="https://chat.whatsapp.com/…"
          autoCapitalize="none"
          autoCorrect="off"
        />
      </label>
      <p className="chapter-form__meta">
        In WhatsApp: open the group, tap its name, choose Invite via link, then Copy link. Leave this
        empty to hide the join button.
      </p>

      {saved && <p className="admin__notice">Saved. The join button now uses this link.</p>}
      {errors.length > 0 && (
        <ul className="chapter-form__errors" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <ProgressButton idleLabel="Save link" busy={saving} label="Saving…" />
    </form>
  )
}

function DayTimeFields(props: {
  dayLabel: string
  timeLabel: string
  offLabel: string
  day: string
  time: string
  onDay: (value: string) => void
  onTime: (value: string) => void
}) {
  return (
    <>
      <label>
        {props.dayLabel}
        <select value={props.day} onChange={(event) => props.onDay(event.target.value)}>
          <option value="">{props.offLabel}</option>
          {WEEKDAYS.map((name, index) => (
            <option key={name} value={String(index)}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {props.timeLabel}
        <input type="time" value={props.time} onChange={(event) => props.onTime(event.target.value)} />
      </label>
    </>
  )
}

function ReminderForm({ initial }: { initial: ReminderSettings }) {
  const [discussionDay, setDiscussionDay] = useState(
    initial.discussionWeekday === null ? '' : String(initial.discussionWeekday),
  )
  const [discussionTime, setDiscussionTime] = useState(initial.discussionTime)
  const [streakDay, setStreakDay] = useState(
    initial.streakWeekday === null ? '' : String(initial.streakWeekday),
  )
  const [streakTime, setStreakTime] = useState(initial.streakTime)
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setErrors([])
    setSaved(false)

    const result = await saveReminderSettings({
      discussionWeekday: discussionDay === '' ? null : Number(discussionDay),
      discussionTime,
      streakWeekday: streakDay === '' ? null : Number(streakDay),
      streakTime,
    })
    if (result.ok) setSaved(true)
    else setErrors(result.errors)
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="chapter-form__form">
      <DayTimeFields
        dayLabel="Weekly discussion day"
        timeLabel="Discussion starts at (Lagos time)"
        offLabel="No discussion reminder"
        day={discussionDay}
        time={discussionTime}
        onDay={setDiscussionDay}
        onTime={setDiscussionTime}
      />
      <p className="chapter-form__meta">
        Readers get a reminder 2 hours before the discussion starts.
      </p>

      <DayTimeFields
        dayLabel="Streak reminder day"
        timeLabel="Streak reminder time (Lagos time)"
        offLabel="No streak reminder"
        day={streakDay}
        time={streakTime}
        onDay={setStreakDay}
        onTime={setStreakTime}
      />
      <p className="chapter-form__meta">
        Sent to readers who finished a chapter last week but none yet this week. Nothing is sent
        before 7 a.m. or after 9 p.m.
      </p>

      {saved && <p className="admin__notice">Saved. The reminders will use these times.</p>}
      {errors.length > 0 && (
        <ul className="chapter-form__errors" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <ProgressButton idleLabel="Save reminders" busy={saving} label="Saving…" />
    </form>
  )
}

interface Loaded {
  link: string
  reminders: ReminderSettings
}

export default function AdminSettingsScreen() {
  // undefined = still loading
  const [loaded, setLoaded] = useState<Loaded | undefined>(undefined)

  useEffect(() => {
    Promise.all([loadWhatsAppSetting(), loadReminderSettings()]).then(([link, reminders]) =>
      setLoaded({ link, reminders }),
    )
  }, [])

  if (!loaded) return <p className="admin-message">Loading settings…</p>

  return (
    <div className="chapter-form">
      <Link to="/admin" className="chapter-form__back">
        ← All books
      </Link>
      <h1>Settings</h1>

      <h2 style={{ margin: '8px 0 12px' }}>WhatsApp group</h2>
      <WhatsAppForm initial={loaded.link} />

      <h2 style={{ margin: '32px 0 12px' }}>Reminders</h2>
      <ReminderForm initial={loaded.reminders} />
    </div>
  )
}