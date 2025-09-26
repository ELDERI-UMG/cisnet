const jwt = require('jsonwebtoken');

class JwtService {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura_para_jwt_2024';
        this.expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    }

    generateToken(payload) {
        try {
            return jwt.sign(payload, this.secret, {
                expiresIn: this.expiresIn,
                issuer: 'software-sales-system',
                audience: 'software-sales-users'
            });
        } catch (error) {
            throw new Error('Error generando token JWT');
        }
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret, {
                issuer: 'software-sales-system',
                audience: 'software-sales-users'
            });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            } else {
                throw new Error('Error verificando token');
            }
        }
    }

    decodeToken(token) {
        try {
            return jwt.decode(token);
        } catch (error) {
            throw new Error('Error decodificando token');
        }
    }

    getTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1];
    }
}

module.exports = JwtService;

