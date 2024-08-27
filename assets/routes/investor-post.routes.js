const Router = require('express')
const router = new Router()
const investorPostController = require('../controller/investor-post.controller')


router.post('/post', investorPostController.createInvestorPost)
router.get('/post', investorPostController.getInvestorPostsByUser)



module.exports = router