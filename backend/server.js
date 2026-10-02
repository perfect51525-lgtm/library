import 'dotenv/config'
import app from './app.js'
import { connectDatabase } from './database.js'

const required = ['MONGODB_URI', 'JWT_SECRET']
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required. Copy backend/.env.example to backend/.env and configure it.`)
}

const port = process.env.PORT || 5000
await connectDatabase()
app.listen(port, () => console.log(`Library API listening on http://localhost:${port}`))