import type { Badge, Book } from '../models'

const MILESTONES = [
  { count: 1, id: 'first-book', name: 'First Book Finished', description: 'You finished your first book.' },
  { count: 3, id: 'bookworm', name: 'Bookworm', description: 'You finished 3 books.' },
  { count: 5, id: 'page-turner', name: 'Page Turner', description: 'You finished 5 books.' },
  { count: 10, id: 'library-legend', name: 'Library Legend', description: 'You finished 10 books.' },
]

export function getEarnedBadges(finishedBooks: Book[]): Badge[] {
  const uniqueBooks = [...new Map(finishedBooks.map((book) => [book.id, book])).values()]

  const milestoneBadges: Badge[] = MILESTONES.filter(
    (milestone) => uniqueBooks.length >= milestone.count,
  ).map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
    description: milestone.description,
  }))

  const bookBadges: Badge[] = uniqueBooks.map((book) => ({
    id: `finished:${book.id}`,
    name: `Finished ${book.title}`,
    description: `You finished ${book.title}.`,
  }))

  return [...milestoneBadges, ...bookBadges]
}