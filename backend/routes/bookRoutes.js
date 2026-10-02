import { Router } from 'express'
import { createBook, deleteBook, listBooks, updateBook } from '../controllers/bookController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)
router.get('/', asyncHandler(listBooks))
router.post('/', asyncHandler(createBook))
router.put('/:id', asyncHandler(updateBook))
router.delete('/:id', asyncHandler(deleteBook))

export default router