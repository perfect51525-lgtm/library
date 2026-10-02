import app from '../backend/app.js'
import { connectDatabase } from '../backend/database.js'

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    console.error('MONGODB_URI and JWT_SECRET must be configured in Vercel.')
    return res.status(500).json({ message: 'The API is not configured.' })
  }

  try {
    await connectDatabase()
  } catch (error) {
    console.error('Could not connect to MongoDB.', error)
    return res.status(503).json({ message: 'The database is temporarily unavailable.' })
  }

  return app(req, res)
}
