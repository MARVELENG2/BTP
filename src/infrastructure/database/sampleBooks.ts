import type { Book } from '@/domain/models'

const sample = (id: string, title: string, isFeatured = false): Book => ({
  id,
  title,
  author: 'Sample Author',
  description:
    'A sample description for this book. The real description will come from the admin page when the book is uploaded.',
  coverUrl: '',
  totalChapters: 24,
  chaptersPerWeek: 2,
  unlockWeekday: 1,
  startDate: '2026-10-05',
  isFeatured,
})

export const sampleBooks: Book[] = [
  sample('book-1', 'The Lagos Letters', true),
  sample('book-2', 'Midnight in Surulere', true),
  sample('book-3', 'Harmattan Hearts'),
  sample('book-4', 'The Last Danfo'),
  sample('book-5', 'Between Two Rivers'),
  sample('book-6', 'Ink and Palm Wine'),
  sample('book-7', 'The Quiet Compound'),
]