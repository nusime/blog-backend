import {query} from "../config/db.js";

class Users {

    static Roles = {
        READER: 'reader',
        BLOGGER: 'blogger',
        ADMIN: 'admin'
    }

    static ROLE_HIERARCHY = {
        [this.Roles.READER]: 1,
        [this.Roles.BLOGGER]: 2,
        [this.Roles.ADMIN]: 3
    }

    static async create(userData) {
        const { username, email, password_hash, role = this.Roles.READER} = userData;

        if(!Object.values(this.Roles).includes(role)){
            throw new Error(`Invalid role specified: ${role}`);
        }

        const sql = `
            INSERT INTO users (username, email, password_hash, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, email, role, created_at`;
        const values = [username, email, password_hash, role];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static can(user, action){
        const permissions = {
            'read_posts': [this.Roles.READER, this.Roles.BLOGGER, this.Roles.ADMIN],
            'create_posts': [this.Roles.BLOGGER, this.Roles.ADMIN],
            'edit_own_post': [this.Roles.BLOGGER, this.Roles.ADMIN],
            'edit_any_post': [this.Roles.ADMIN],
            'delete_own_post': [this.Roles.BLOGGER, this.Roles.ADMIN],
            'delete_any_post': [this.Roles.ADMIN],
            'manage_users': [this.Roles.ADMIN]
        };

        return permissions[action]?.includes(user.role) || false;
    }

    static hasMinRole(user, requiredRole) {
        const userLevel = this.ROLE_HIERARCHY[user.role] || 0;
        const requiredLevel = this.ROLE_HIERARCHY[requiredRole] || 0;
        return userLevel >= requiredLevel;
    }

    static async promote(userId, newRole) {
        if(!Object.values(this.Roles).includes(newRole)) {
            throw new Error(`Invalid role specified: ${newRole}`);
        }

        const sql = `
            UPDATE users
            SET role = $1
            WHERE id = $2
            RETURNING id, username, email, role, created_at`;
        const values = [newRole, userId];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findByRole(role) {
        if(!Object.values(this.Roles).includes(role)) {
            throw new Error(`Invalid role specified: ${role}`);
        }

        const sql = `SELECT id, username, email, role, created_at FROM users WHERE role = $1`;
        const values = [role];
        const results = await query(sql, values);
        return results.rows;
    }

    static async findById(id) {
        const sql = `SELECT * FROM users WHERE id = $1`;
        const values = [id];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findByUsername(username) {
        const sql = `SELECT * FROM users WHERE username = $1`;
        const values = [username];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findByEmail(email){
        const sql = `SELECT * FROM users WHERE email = $1`;
        const values = [email];
        const results = await query(sql, values);
        return results.rows[0];
    }

    static async findAll() {
        const sql =` SELECT * FROM users`;
        const results = await query(sql);
        return results.rows;
    }
}

export default Users;