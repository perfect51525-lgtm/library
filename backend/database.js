import mongoose from 'mongoose'

let connectionPromise

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return
  if (mongoose.connection.readyState === 0) connectionPromise = undefined
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
      connectionPromise = undefined
      throw error
    })
  }
  await connectionPromise
}
