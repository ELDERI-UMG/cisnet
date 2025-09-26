const User = require('../../domain/entities/User');

class RegisterUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(registerUserDto) {
        try {
            // Verificar si el email ya existe
            const existingUser = await this.userRepository.findByEmail(registerUserDto.email);
            if (existingUser) {
                throw new Error('Ya existe un usuario con este email');
            }

            // Crear nueva entidad de usuario
            const user = User.create(
                registerUserDto.name,
                registerUserDto.email,
                registerUserDto.password
            );

            // Guardar usuario en el repositorio
            const savedUser = await this.userRepository.save(user);

            // Retornar datos del usuario sin información sensible
            return {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.getEmailValue(),
                createdAt: savedUser.createdAt,
                message: 'Usuario registrado con éxito'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RegisterUser;

