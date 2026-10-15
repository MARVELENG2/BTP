import type { Gender } from '@/domain/models'

export type HairStyle =
  | 'short'
  | 'afro'
  | 'bun'
  | 'long'
  | 'braids'
  | 'headwrap'
  | 'curly'
  | 'cap'
  | 'bald'
  | 'locs'
  | 'bob'
  | 'ponytail'

export interface AvatarSpec {
  style: HairStyle
  skin: string
  hair: string
  accent: string
  background: string
  cloth: string
  beard?: boolean
  glasses?: boolean
}

const make = (
  style: HairStyle,
  skin: string,
  hair: string,
  background: string,
  cloth: string,
  extra: Partial<AvatarSpec> = {},
): AvatarSpec => ({ style, skin, hair, background, cloth, accent: '#2E7D4F', ...extra })

const DEFINITIONS: Record<Gender, AvatarSpec[]> = {
  female: [
    make('long', '#6B3E26', '#1A1210', '#E8F3EC', '#2E7D4F'),
    make('braids', '#4A2C1A', '#1A1210', '#F5ECD7', '#7A5230'),
    make('bun', '#8D5524', '#2B1B12', '#DDEBDD', '#7A5230'),
    make('afro', '#A9683A', '#1A1210', '#EAD9C6', '#2E7D4F'),
    make('headwrap', '#6B3E26', '#1A1210', '#E8F3EC', '#1F5C3A', { accent: '#C0392B' }),
    make('curly', '#C68642', '#2B1B12', '#F2E3CF', '#5C3D22'),
    make('bob', '#4A2C1A', '#1A1210', '#D6E6DA', '#9A6B3F'),
    make('ponytail', '#E0AC69', '#3B2314', '#F5ECD7', '#4C9A6A'),
  ],
  male: [
    make('short', '#6B3E26', '#1A1210', '#E8F3EC', '#7A5230'),
    make('afro', '#4A2C1A', '#1A1210', '#F5ECD7', '#2E7D4F'),
    make('cap', '#8D5524', '#1A1210', '#EAD9C6', '#5C3D22'),
    make('bald', '#6B3E26', '#1A1210', '#DDEBDD', '#9A6B3F', { beard: true }),
    make('locs', '#4A2C1A', '#1A1210', '#F2E3CF', '#1F5C3A'),
    make('short', '#A9683A', '#2B1B12', '#D6E6DA', '#7A5230', { beard: true }),
    make('short', '#C68642', '#1A1210', '#E8F3EC', '#4C9A6A', { glasses: true }),
    make('curly', '#E0AC69', '#2B1B12', '#F5ECD7', '#2E7D4F'),
  ],
  unspecified: [
    make('cap', '#6B3E26', '#1A1210', '#E8F3EC', '#2E7D4F', { accent: '#7A5230' }),
    make('headwrap', '#4A2C1A', '#1A1210', '#F5ECD7', '#7A5230', { accent: '#E0A030' }),
    make('short', '#A9683A', '#1A1210', '#DDEBDD', '#5C3D22', { glasses: true }),
    make('afro', '#8D5524', '#2B1B12', '#EAD9C6', '#1F5C3A'),
    make('bun', '#C68642', '#1A1210', '#D6E6DA', '#9A6B3F'),
    make('curly', '#6B3E26', '#1A1210', '#F2E3CF', '#4C9A6A'),
    make('bald', '#4A2C1A', '#1A1210', '#E8F3EC', '#7A5230', { glasses: true }),
    make('locs', '#E0AC69', '#1A1210', '#F5ECD7', '#2E7D4F'),
  ],
}

export const AVATAR_SPECS: Record<string, AvatarSpec> = Object.fromEntries(
  (Object.keys(DEFINITIONS) as Gender[]).flatMap((gender) =>
    DEFINITIONS[gender].map((spec, i): [string, AvatarSpec] => [`${gender}-${i + 1}`, spec]),
  ),
)

export const FALLBACK_AVATAR: AvatarSpec = make(
  'short',
  '#6B3E26',
  '#1A1210',
  '#E8F3EC',
  '#2E7D4F',
)