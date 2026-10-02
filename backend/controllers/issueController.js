import Book from '../models/Book.js'
import Issue from '../models/Issue.js'
import User from '../models/User.js'

export async function listIssues(req, res) {
  const filter = req.query.status ? { status: req.query.status } : {}
  const issues = await Issue.find(filter)
    .populate('bookId', 'title author isbn')
    .populate('userId', 'name email')
    .sort({ issueDate: -1 })
  res.json(issues)
}

export async function createIssue(req, res) {
  const { bookId, userId, dueDate } = req.body
  const member = await User.findOne({ _id: userId, role: 'member' })
  if (!member) return res.status(404).json({ message: 'Choose a valid member.' })
  const dateDue = dueDate ? new Date(`${dueDate}T23:59:59`) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  if (Number.isNaN(dateDue.getTime()) || dateDue <= new Date()) {
    return res.status(400).json({ message: 'Due date must be in the future.' })
  }

  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true },
  )
  if (!book) return res.status(409).json({ message: 'That title has no available copies.' })

  let issue
  try {
    issue = await Issue.create({ bookId: book.id, userId: member.id, dueDate: dateDue })
  } catch (error) {
    await Book.updateOne({ _id: book.id }, { $inc: { availableCopies: 1 } })
    throw error
  }
  await issue.populate([{ path: 'bookId', select: 'title author isbn' }, { path: 'userId', select: 'name email' }])
  res.status(201).json(issue)
}

export async function returnIssue(req, res) {
  const issue = await Issue.findOneAndUpdate(
    { _id: req.params.id, status: 'issued' },
    { $set: { status: 'returned', returnDate: new Date() } },
    { new: true },
  )
  if (!issue) return res.status(404).json({ message: 'Open loan not found.' })
  await Book.updateOne({ _id: issue.bookId }, { $inc: { availableCopies: 1 } })
  await issue.populate([{ path: 'bookId', select: 'title author isbn' }, { path: 'userId', select: 'name email' }])
  res.json(issue)
}