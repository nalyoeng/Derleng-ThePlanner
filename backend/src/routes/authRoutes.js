import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
const router = express.Router();
// get/api/auth/me

router.get('/me',protect, (req,res)=>{
    return res.status(200).json(
        {
            success: true,
            user:{
                id:req.user.id,
                email: req.user.email,
            },
            profile: req.profile,
        }
    )
})
export default router;