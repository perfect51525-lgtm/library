import { Router } from 'express'
import { createMember, deleteMember, listMembers, updateMember } from '../controllers/memberController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)
router.get('/', asyncHandler(listMembers))
router.post('/', asyncHandler(createMember))
router.put('/:id', asyncHandler(updateMember))
router.delete('/:id', asyncHandler(deleteMember))

export default router