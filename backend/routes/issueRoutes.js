import { Router } from 'express'
import { createIssue, listIssues, returnIssue } from '../controllers/issueController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)
router.get('/', asyncHandler(listIssues))
router.post('/', asyncHandler(createIssue))
router.patch('/:id/return', asyncHandler(returnIssue))

export default router