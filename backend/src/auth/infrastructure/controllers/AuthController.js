const RegisterUser = require('../../application/useCases/RegisterUser');
const LoginUser = require('../../application/useCases/LoginUser');
const RecoverPassword = require('../../application/useCases/RecoverPassword');
const RegisterUserDto = require('../../application/dtos/RegisterUserDto');
const LoginUserDto = require('../../application/dtos/LoginUserDto');
const MySqlUserRepository = require('../repositories/MySqlUserRepository');

class AuthController {
    constructor() {
        this.userRepository = new MySqlUserRepository();
        this.registerUser = new RegisterUser(this.userRepository);
        this.loginUser = new LoginUser(this.userRepository);
        this.recoverPassword = new RecoverPassword(this.userRepository);
    }

    register = async (req, res, next) => {
        try {
            const registerDto = RegisterUserDto.fromRequest(req);
            const result = await this.registerUser.execute(registerDto);
            
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req, res, next) => {
        try {
            console.log("DEBUG AuthController - login called with body:", req.body);
            const loginDto = LoginUserDto.fromRequest(req);
            console.log("DEBUG AuthController - loginDto created:", loginDto);
            const result = await this.loginUser.execute(loginDto);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    recover = async (req, res, next) => {
        try {
            const { email } = req.body;
            await this.recoverPassword.execute(email);
            
            res.json({
                success: true,
                message: 'Instrucciones de recuperación enviadas al email'
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req, res, next) => {
        try {
            const { token, newPassword } = req.body;
            // Implementar lógica de reset
            
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };

    logout = async (req, res, next) => {
        try {
            res.json({
                success: true,
                message: 'Sesión cerrada exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };

    profile = async (req, res, next) => {
        try {
            const user = await this.userRepository.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }

            res.json({
                id: user.id,
                name: user.name,
                email: user.email
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AuthController;

