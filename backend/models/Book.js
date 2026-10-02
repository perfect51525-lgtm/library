import mongoose from 'mongoose'

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    author: { type: String, required: true, trim: true, maxlength: 120 },
    isbn: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    totalCopies: { type: Number, required: true, min: 1 },
    availableCopies: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
)

export default mongoose.model('Book', bookSchema)