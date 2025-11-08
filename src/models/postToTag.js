import { query } from "../config/db";

class postToTag {
    static async create(postId, tagId) {
        const sql = `
            INSERT INTO post_to_tag (post_id, tag_id)
            VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`;
        const values = [postId, tagId];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findTagsByPostId(postId) {
        const sql = `
            SELECT t.*
            FROM tags t
            JOIN post_to_tag p2t ON t.id = p2t.tag_id
            WHERE p2t.post_id = $1`;
        const values = [postId];
        const results = await query(sql, values);
        return results.rows;
    }
}

export default postToTag;