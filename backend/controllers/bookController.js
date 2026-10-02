import Book from '../models/Book.js'

export async function listBooks(req, res) {
  const { search = '', category, availability } = req.query
  const filter = {}
  if (category) filter.category = category
  if (availability === 'available') filter.availableCopies = { $gt: 0 }
  if (availability === 'unavailable') filter.availableCopies = 0
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = new RegExp(escaped, 'i')
    filter.$or = [{ title: match }, { author: match }, { isbn: match }]
  }
  res.json(await Book.find(filter).sort({ title: 1 }))
}

export async function createBook(req, res) {
  const { title, author, isbn, category, totalCopies } = req.body
  if (!title?.trim() || !author?.trim() || !isbn?.trim() || !category?.trim() || !Number.isInteger(Number(totalCopies)) || Number(totalCopies) < 1) {
    return res.status(400).json({ message: 'Complete all fields and enter at least one copy.' })
  }
  const book = await Book.create({ title, author, isbn, category, totalCopies: Number(totalCopies), availableCopies: Number(totalCopies) })
  res.status(201).json(book)
}

export async function updateBook(req, res) {
  const { title, author, isbn, category, totalCopies } = req.body
  const book = await Book.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found.' })
  const changes = { title, author, isbn, category }
  for (const [key, value] of Object.entries(changes)) {
    if (value !== undefined) book[key] = value
  }
  if (totalCopies !== undefined) {
    const checkedOut = book.totalCopies - book.availableCopies
    if (!Number.isInteger(Number(totalCopies)) || Number(totalCopies) < checkedOut) {
      return res.status(400).json({ message: `Total copies cannot be lower than the ${checkedOut} copies currently on loan.` })
    }
    book.totalCopies = Number(totalCopies)
    book.availableCopies = book.totalCopies - checkedOut
  }
  await book.save()
  res.json(book)
}

export async function deleteBook(req, res) {
  const book = await Book.findById(req.params.id)
  if (!book) return res.status(404).json({ message: 'Book not found.' })
  if (book.availableCopies !== book.totalCopies) {
    return res.status(409).json({ message: 'Return every copy before removing this title.' })
  }
  await book.deleteOne()
  res.json({ message: 'Book removed.' })
}