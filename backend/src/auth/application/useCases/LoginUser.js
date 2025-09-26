const JwtService = require('../../infrastructure/services/JwtService');

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.jwtService = new JwtService();
    }

    async execute(loginUserDto) {
        try {
            console.log("DEBUG LoginUser - loginUserDto:", loginUserDto);
            // Buscar usuario por email
            const user = await this.userRepository.findByEmail(loginUserDto.email);
            console.log("DEBUG LoginUser - user found:", user);
            if (!user) {
                throw new Error('Credenciales inválidas');
            }

            // Verificar contraseña
            console.log("DEBUG LoginUser - About to verify password");
            const isValidPassword = await this.userRepository.verifyPassword(loginUserDto.password, user.password);
            if (!isValidPassword) {
                throw new Error('Credenciales inválidas');
            }

            // Generar token JWT
            const token = this.jwtService.generateToken({
                id: user.id,
                email: user.email,
                name: user.name
            });

            return {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token,
                message: 'Inicio de sesión exitoso'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LoginUser;

