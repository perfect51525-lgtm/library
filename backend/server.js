import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/authRoutes.js'
import bookRoutes from './routes/bookRoutes.js'
import issueRoutes from './routes/issueRoutes.js'
import memberRoutes from './routes/memberRoutes.js'
import { getDashboard } from './controllers/dashboardController.js'
import { asyncHandler } from './middleware/asyncHandler.js'
import { requireAdmin } from './middleware/auth.js'

const required = ['MONGODB_URI', 'JWT_SECRET']
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required. Copy backend/.env.example to backend/.env and configure it.`)
}

const app = express()
const documentationPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'documentation')
const downloadableFiles = {
  pptx: 'Stacks-Frontend-Walkthrough.pptx',
  pdf: 'Stacks-Frontend-Walkthrough-and-Code.pdf',
}
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173']
app.use(cors({ origin: clientOrigins }))
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.get('/api/downloads/:format', (req, res, next) => {
  const filename = downloadableFiles[req.params.format]
  if (!filename) return res.status(404).json({ message: 'Download not found.' })
  res.download(path.join(documentationPath, filename), filename, next)
})
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/issues', issueRoutes)
app.get('/api/dashboard', requireAdmin, asyncHandler(getDashboard))

app.use((error, req, res, next) => {
  if (error.code === 11000) return res.status(409).json({ message: 'That email address or ISBN is already in use.' })
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid record identifier.' })
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message })
  console.error(error)
  res.status(500).json({ message: 'Something went wrong on the server.' })
})

const port = process.env.PORT || 5000
await mongoose.connect(process.env.MONGODB_URI)
app.listen(port, () => console.log(`Library API listening on http://localhost:${port}`))