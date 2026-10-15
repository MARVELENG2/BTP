import {
  LINE_SPACING_RANGE,
  READING_DESIGNS,
  READING_FONTS,
  READING_MODES,
  TEXT_SIZE_RANGE,
  TEXTURES,
  defaultPreferences,
  type ReadingPreferences,
} from '../models'

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

function clamp(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

export function normalizePreferences(raw: unknown): ReadingPreferences {
  const input = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>

  return {
    readingMode: pick(input.readingMode, READING_MODES, defaultPreferences.readingMode),
    theme: pick(input.theme, READING_DESIGNS, defaultPreferences.theme),
    pageColor:
      typeof input.pageColor === 'string' && HEX_COLOR.test(input.pageColor)
        ? input.pageColor
        : defaultPreferences.pageColor,
    font: pick(input.font, READING_FONTS, defaultPreferences.font),
    textSize: Math.round(
      clamp(input.textSize, TEXT_SIZE_RANGE.min, TEXT_SIZE_RANGE.max, defaultPreferences.textSize),
    ),
    lineSpacing:
      Math.round(
        clamp(
          input.lineSpacing,
          LINE_SPACING_RANGE.min,
          LINE_SPACING_RANGE.max,
          defaultPreferences.lineSpacing,
        ) * 10,
      ) / 10,
    nightMode:
      typeof input.nightMode === 'boolean' ? input.nightMode : defaultPreferences.nightMode,
    texture: pick(input.texture, TEXTURES, defaultPreferences.texture),
  }
}