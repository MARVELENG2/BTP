export const READING_MODES = ['flip', 'scroll'] as const
export const READING_DESIGNS = ['classic', 'clean'] as const
export const READING_FONTS = ['serif', 'sans', 'book', 'mono'] as const
export const TEXTURES = ['none', 'paper', 'parchment'] as const

export type ReadingMode = (typeof READING_MODES)[number]
export type ReadingDesign = (typeof READING_DESIGNS)[number]
export type ReadingFont = (typeof READING_FONTS)[number]
export type Texture = (typeof TEXTURES)[number]

export const TEXT_SIZE_RANGE = { min: 14, max: 28 } as const
export const LINE_SPACING_RANGE = { min: 1.3, max: 2.2 } as const

export interface ReadingPreferences {
  readingMode: ReadingMode
  theme: ReadingDesign
  pageColor: string
  font: ReadingFont
  textSize: number
  lineSpacing: number
  nightMode: boolean
  texture: Texture
}

export const defaultPreferences: ReadingPreferences = {
  readingMode: 'flip', // flip is the default, reader can switch to scroll
  theme: 'classic',
  pageColor: '#FFFFFF',
  font: 'serif',
  textSize: 18,
  lineSpacing: 1.6,
  nightMode: false,
  texture: 'none',
}