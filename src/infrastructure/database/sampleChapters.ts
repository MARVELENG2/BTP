import type { Book, Chapter } from '@/domain/models'

const TITLES = [
  'A Quiet Beginning',
  'Visitors at Dusk',
  'The Letter',
  'Crossed Paths',
  'What the River Knew',
  'Unspoken',
  'The Long Way Home',
  'Turning the Page',
]

// Sample text, written as placeholder content only.
const PARAGRAPHS = [
  'The rain had stopped an hour ago, but the street still smelled of wet earth and fried plantain. Adaeze stood at the bus stop with her bag against her chest, watching the danfos rattle past, each one painted a brighter yellow than the last.',
  'She had promised herself she would not open the letter until she was home. It sat in her bag like a small, warm stone, and every few minutes her hand drifted toward the zip and was called back by her better judgment.',
  'A woman selling oranges nodded at her without a word. In this city, silence could be a kind of greeting, a way of saying that you were seen and that nothing more was required of you.',
  'When the bus finally came, it was packed so tightly that the conductor had to pull her in by the strap of her bag. She found a sliver of seat beside an old man who was reading a newspaper folded into a neat, narrow rectangle.',
  'The old man did not look up, but he shifted his elbow to give her room. Outside, the shops slid by in a blur of faded signboards and blaring music, and for a moment she forgot the letter altogether.',
  "It was the smell of her mother's kitchen that brought her back: pepper, onions, and the faint sweetness of burnt sugar. She realised the bus had stopped at her junction, and that she had been smiling for no reason at all.",
  'The compound gate creaked the way it always did. Somewhere behind the louvres a radio was playing an old highlife record, and the evening felt for a moment as if it had been waiting for her.',
  'She sat on the front step, took out the letter, and turned it over in her hands. Whatever it said, she thought, it could wait one more minute. One more minute between the pages of an ordinary day.',
]

function buildContent(chapterNumber: number): string {
  const start = chapterNumber % PARAGRAPHS.length
  const rotated = [...PARAGRAPHS.slice(start), ...PARAGRAPHS.slice(0, start)]
  return [...rotated, ...rotated].join('\n\n')
}

// Temporary: generates placeholder chapters until the admin page and real storage exist.
export function getSampleChapters(book: Book): Chapter[] {
  return Array.from({ length: book.totalChapters }, (_, i) => ({
    id: `${book.id}-ch-${i + 1}`,
    bookId: book.id,
    number: i + 1,
    title: TITLES[i % TITLES.length],
    content: buildContent(i + 1),
  }))
}