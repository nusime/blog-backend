import { query } from "../config/db";

class Posts {
    static async create(postData) {
        const { title, slug, content, author_id, published = FALSE } = postData;
        const sql = `
            INSERT INTO posts (title, slug, content, author_id, published)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
        const values = [title, slug, content, author_id, published];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findAll() {
        const sql = `
            SELECT p.*, u.username AS author_name
            FROM posts p 
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC`;
        const results = await query(sql);
        return results.rows;
    }

    static async findById(id) {
        const sql = `
            SELECT p.*, u.username AS author_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.id = $1`;
        const values = [id];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findBySlug(slug) {
        const sql = `
            SELECT p.*, u.username AS author_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.slug = $1`;
        const values = [slug];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async update(id, postData) {
        const {title, content} = postData;
        const sql = `
            UPDATE posts
            SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            RETURNING *`;
        const values = [title, content, id];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async delete(id) {
        const sql = `DELETE FROM posts WHERE id = $1 RETURNING *`;
        const values = [id];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async listPosts(limit = 10, offset = 0) {
        const sql = `
            SELECT p.*, u.username AS author_name
            FROM posts p
            JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
            LIMIT $1 OFFSET $2`;
        const values = [limit, offset];
        const results = await query(sql, values);
        return results.rows;
    }

}

export default Posts;