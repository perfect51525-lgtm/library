import 'dotenv/config'
import mongoose from 'mongoose'
import Book from './models/Book.js'

const starterBooks = [
  { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '9780061122415', category: 'Fiction', totalCopies: 3 },
  { title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', category: 'Classic', totalCopies: 2 },
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', category: 'Fantasy', totalCopies: 3 },
  { title: 'Atomic Habits', author: 'James Clear', isbn: '9780735211292', category: 'Personal development', totalCopies: 4 },
  { title: 'Deep Work', author: 'Cal Newport', isbn: '9781455586691', category: 'Productivity', totalCopies: 2 },
  { title: 'Sapiens', author: 'Yuval Noah Harari', isbn: '9780062316097', category: 'History', totalCopies: 2 },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', category: 'Memoir', totalCopies: 2 },
  { title: 'The Psychology of Money', author: 'Morgan Housel', isbn: '9780857197689', category: 'Finance', totalCopies: 3 },
]

try {
  await mongoose.connect(process.env.MONGODB_URI)
  const results = await Promise.all(starterBooks.map((book) => Book.updateOne(
    { isbn: book.isbn },
    { $setOnInsert: { ...book, availableCopies: book.totalCopies } },
    { upsert: true },
  )))
  const added = results.filter((result) => result.upsertedCount === 1).length
  console.log(`Catalog ready: added ${added} titles; ${starterBooks.length - added} were already present.`)
} finally {
  await mongoose.disconnect()
}