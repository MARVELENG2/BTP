import {
  LINE_SPACING_RANGE,
  TEXT_SIZE_RANGE,
  type ReadingDesign,
  type ReadingMode,
  type ReadingPreferences,
  type Texture,
} from '@/domain/models'
import { FONT_OPTIONS, FONT_STACKS, PAGE_COLORS } from '@/presentation/theme/readerOptions'
import './ReaderSettings.css'

interface ReaderSettingsProps {
  preferences: ReadingPreferences
  onChange: (patch: Partial<ReadingPreferences>) => void
  onClose: () => void
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}

function Segmented<T extends string>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <div className="settings__group">
      <p className="settings__label">{label}</p>
      <div className="settings__segmented" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={
              option.value === value
                ? 'settings__segment settings__segment--active'
                : 'settings__segment'
            }
            aria-pressed={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const MODE_OPTIONS: { value: ReadingMode; label: string }[] = [
  { value: 'flip', label: 'Flip pages' },
  { value: 'scroll', label: 'Scroll' },
]

const DESIGN_OPTIONS: { value: ReadingDesign; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'clean', label: 'Clean' },
]

const TEXTURE_OPTIONS: { value: Texture; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'paper', label: 'Paper' },
  { value: 'parchment', label: 'Parchment' },
]

export default function ReaderSettings({ preferences, onChange, onClose }: ReaderSettingsProps) {
  return (
    <div className="settings" role="dialog" aria-label="Reading settings">
      <button
        type="button"
        className="settings__backdrop"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div className="settings__sheet">
        <div className="settings__header">
          <h2>Reading settings</h2>
          <button type="button" className="settings__close" onClick={onClose}>
            Done
          </button>
        </div>

        <Segmented
          label="Reading mode"
          value={preferences.readingMode}
          options={MODE_OPTIONS}
          onChange={(readingMode) => onChange({ readingMode })}
        />

        <div className="settings__group">
          <p className="settings__label">Page color</p>
          <div className="settings__swatches">
            {PAGE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={
                  color.value === preferences.pageColor
                    ? 'settings__swatch settings__swatch--active'
                    : 'settings__swatch'
                }
                style={{ background: color.value }}
                aria-label={color.label}
                aria-pressed={color.value === preferences.pageColor}
                onClick={() => onChange({ pageColor: color.value })}
              />
            ))}
          </div>
        </div>

        <Segmented
          label="Page design"
          value={preferences.theme}
          options={DESIGN_OPTIONS}
          onChange={(theme) => onChange({ theme })}
        />

        <div className="settings__group">
          <p className="settings__label">Font</p>
          <div className="settings__fonts">
            {FONT_OPTIONS.map((font) => (
              <button
                key={font.value}
                type="button"
                className={
                  font.value === preferences.font
                    ? 'settings__font settings__font--active'
                    : 'settings__font'
                }
                style={{ fontFamily: FONT_STACKS[font.value] }}
                aria-pressed={font.value === preferences.font}
                onClick={() => onChange({ font: font.value })}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings__group">
          <p className="settings__label">
            <span>Text size</span>
            <span>{preferences.textSize}px</span>
          </p>
          <input
            className="settings__range"
            type="range"
            min={TEXT_SIZE_RANGE.min}
            max={TEXT_SIZE_RANGE.max}
            step={1}
            value={preferences.textSize}
            aria-label="Text size"
            onChange={(event) => onChange({ textSize: Number(event.target.value) })}
          />
        </div>

        <div className="settings__group">
          <p className="settings__label">
            <span>Line spacing</span>
            <span>{preferences.lineSpacing.toFixed(1)}</span>
          </p>
          <input
            className="settings__range"
            type="range"
            min={LINE_SPACING_RANGE.min}
            max={LINE_SPACING_RANGE.max}
            step={0.1}
            value={preferences.lineSpacing}
            aria-label="Line spacing"
            onChange={(event) => onChange({ lineSpacing: Number(event.target.value) })}
          />
        </div>

        <Segmented
          label="Background texture"
          value={preferences.texture}
          options={TEXTURE_OPTIONS}
          onChange={(texture) => onChange({ texture })}
        />

        <div className="settings__group settings__switch-row">
          <p className="settings__label">Night mode</p>
          <button
            type="button"
            role="switch"
            aria-checked={preferences.nightMode}
            aria-label="Night mode"
            className="settings__switch"
            onClick={() => onChange({ nightMode: !preferences.nightMode })}
          />
        </div>
      </div>
    </div>
  )
}