import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashService = {
    async hashPassword(plainPassword, saltRounds = SALT_ROUNDS) {
        if(typeof plainPassword !== 'string' || plainPassword.length === 0) {
            throw new TypeError("Password must be a non-empty string");
        }
        return await bcrypt.hash(plainPassword, saltRounds);
    },

    async comparePassword(plainPassword, hashedPassword) {
        if(typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
            throw new TypeError("Both passwords must be non-empty strings");
        }
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
};