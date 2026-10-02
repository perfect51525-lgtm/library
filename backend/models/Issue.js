import mongoose from 'mongoose'

const issueSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    issueDate: { type: Date, required: true, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date, default: null },
    status: { type: String, enum: ['issued', 'returned'], default: 'issued' },
  },
  { timestamps: true },
)

issueSchema.index({ status: 1, dueDate: 1 })

export default mongoose.model('Issue', issueSchema)