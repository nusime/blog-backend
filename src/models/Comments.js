import { query } from "../config/db";

class Comments {
    static async create(commentData) {
        const { content, post_id, user_id } = commentData;
        const sql = `
            INSERT INTO comments (content, post_id, user_id)
            VALUES ($1, $2, $3)
            RETURNING *`;
        const values = [content, post_id, user_id]; // sql injection safe
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findByPostId(post_id) {
        const sql = `
            SELECT c.*, u.username AS author_name
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = $1
            ORDER BY c.created_at DESC`;
        const values = [post_id];
        const results = await query(sql, values);
        return results.rows;
    }

    static async findById(id) {
        const sql = `SELECT * FROM comments WHERE id = $1`;
        const values = [id];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async update(id, content) {
        const sql = `
        UPDATE comments
        SET content = $1,
        WHERE id = $2
        RETURNING *`;
    const values = [content, id];
    const results = await query(sql, values);
    return results.rows[0];
    }

    static async delete(id) {
        const sql  = `DELETE FROM comments WHERE id = $1 RETURNING *`;
        const values = [id];
        const results = await query(sql, values);
        return results.rows[0];
    }
}

export default Comments;