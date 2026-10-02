import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const createToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' })

export async function signup(req, res) {
  const { name, email, password } = req.body
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({ message: 'Name, email, and a password of at least 8 characters are required.' })
  }

  if (await User.exists({ role: 'admin' })) {
    return res.status(409).json({ message: 'An administrator is already set up. Ask them to add your account.' })
  }

  const user = await User.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password: await bcrypt.hash(password, 12),
    role: 'admin',
  })

  res.status(201).json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}

export async function login(req, res) {
  const { email, password } = req.body
  const user = await User.findOne({ email: email?.trim().toLowerCase() }).select('+password')
  if (!user || user.role !== 'admin' || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' })
  }

  res.json({ token: createToken(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
}