const db = require('../../db')

class studentPostController{
    async createStudentPost(req, res){
        const {title, content, userId} = req.body
        const newPost = await db.query("INSERT INTO post (title, content, user_id) values ($1, $2, $3) RETURNING *", [title, content, userId])
        res.json(newPost.rows[0])
    }

    async getStudentPostsByUser(req, res){
        const id = req.query.id
        const posts = await db.query('select * from post where user_id = $1', [id])
        res.json(posts.rows)
    }

}


module.exports = new studentPostController()