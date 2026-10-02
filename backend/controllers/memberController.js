import bcrypt from 'bcryptjs'
import Issue from '../models/Issue.js'
import User from '../models/User.js'

export async function listMembers(req, res) {
  const members = await User.find({ role: 'member' }).select('name email createdAt').sort({ name: 1 })
  res.json(members)
}

export async function createMember(req, res) {
  const { name, email, password } = req.body
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' })
  }
  const member = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: await bcrypt.hash(password, 12), role: 'member' })
  res.status(201).json({ id: member.id, name: member.name, email: member.email, createdAt: member.createdAt })
}

export async function updateMember(req, res) {
  const member = await User.findOne({ _id: req.params.id, role: 'member' })
  if (!member) return res.status(404).json({ message: 'Member not found.' })

  const { name, email, password } = req.body
  if (name !== undefined) {
    if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty.' })
    member.name = name.trim()
  }
  if (email !== undefined) {
    if (!email.trim()) return res.status(400).json({ message: 'Email cannot be empty.' })
    member.email = email.trim().toLowerCase()
  }
  if (password) {
    if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' })
    member.password = await bcrypt.hash(password, 12)
  }

  await member.save()
  res.json({ id: member.id, name: member.name, email: member.email, createdAt: member.createdAt })
}

export async function deleteMember(req, res) {
  const member = await User.findOne({ _id: req.params.id, role: 'member' })
  if (!member) return res.status(404).json({ message: 'Member not found.' })
  if (await Issue.exists({ userId: member.id, status: 'issued' })) {
    return res.status(409).json({ message: 'Resolve this member’s open loans before removing their account.' })
  }
  await member.deleteOne()
  res.json({ message: 'Member removed.' })
}