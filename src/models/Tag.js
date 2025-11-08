import { query } from "../config/db";

class Tag {
    static async create(name) {
        const sql = `
            INSERT INTO tags (name) VALUES ($1)
            ON CONFLICT (name) DO NOTHING RETURNING *`;
        const values = [name];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findByName(name) {
        const sql = `SELECT * FROM tags WHERE name = $1`;
        const values = [name];
        const results = await query(sql, values);
        return results.rows[0];
    }
}

export default Tag;