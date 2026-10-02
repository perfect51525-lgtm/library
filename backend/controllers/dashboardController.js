import Book from '../models/Book.js'
import Issue from '../models/Issue.js'
import User from '../models/User.js'

export async function getDashboard(req, res) {
  const [bookStats, memberCount, issuedCount, overdueCount, recentIssues] = await Promise.all([
    Book.aggregate([{ $group: { _id: null, titles: { $sum: 1 }, copies: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }]),
    User.countDocuments({ role: 'member' }),
    Issue.countDocuments({ status: 'issued' }),
    Issue.countDocuments({ status: 'issued', dueDate: { $lt: new Date() } }),
    Issue.find().populate('bookId', 'title').populate('userId', 'name').sort({ issueDate: -1 }).limit(5),
  ])
  const stats = bookStats[0] || { titles: 0, copies: 0, available: 0 }
  res.json({ ...stats, members: memberCount, issued: issuedCount, overdue: overdueCount, recentIssues })
}