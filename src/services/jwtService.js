import jwt, { sign, verify } from "jsonwebtoken";

export const jwtService = {
    signToken(payload, options={}, secret = null){
        const key = secret || process.env.JWT_SECRET;
        if(!key) throw new Error("JWT secret key is not defined");
        return jwt.sign(payload, key, options);
    },
    verifyToken(token, secret = null){
        const key = secret || process.env.JWT_SECRET;
        if(!key) throw new Error("JWT secret key is not defined");
        return jwt.verify(token, key);
    },
    generateAccessToken(payload){
        const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
        const secret = process.env.JWT_SECRET;
        if(!secret) throw new Error("JWT secret key is not defined");
        return this.signToken(payload, { expiresIn }, secret);
    },
    generateRefreshToken(payload){
        const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if(!secret) throw new Error("Refresh token secret key is not defined");
        return this.signToken(payload, { expiresIn }, secret);
    },
    verifyRefreshToken(token){
        const secret = process.env.REFRESH_TOKEN_SECRET;
        if(!secret) throw new Error("Refresh token secret key is not defined");
        return jwt.verify(token, secret); 
    },
    createTokenPair(payload){
        const accessToken = this.generateAccessToken(payload);
        const refreshToken = this.generateRefreshToken(payload);
        return { accessToken, refreshToken };
    },
    extractTokenFromHeader(headers = {}){
        const authHeader = headers.authorization || headers.Authorization;
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !==2 || parts[0] !== 'Bearer') return null;
        return parts[1];
    }
};