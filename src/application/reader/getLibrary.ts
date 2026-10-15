import type { Book } from '@/domain/models'
import { fetchBooks } from '@/infrastructure/database/bookRepository'

export interface Library {
  featured: Book[]
  shelf: Book[]
}

export async function getLibrary(): Promise<Library> {
  const books = await fetchBooks()
  return {
    featured: books.filter((book) => book.isFeatured),
    shelf: books,
  }
}