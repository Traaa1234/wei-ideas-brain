// Browser-only: bundle every book in content/books.
import type { Book } from './books'
const modules = import.meta.glob('../../content/books/*.json', { eager: true, import: 'default' }) as Record<string, Book>
export const BOOKS: Book[] = Object.values(modules).sort((a, b) => a.step.localeCompare(b.step, undefined, { numeric: true }))
