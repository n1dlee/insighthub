const Router = require('express')
const router = new Router()
const studentPostController = require('../controller/student-post.controller')


router.post('/post', studentPostController.createStudentPost)
router.get('/post', studentPostController.getStudentPostsByUser)



module.exports = router