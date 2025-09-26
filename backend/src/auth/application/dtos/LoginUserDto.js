const Joi = require('joi');

class LoginUserDto {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.validate();
    }

    validate() {
        const schema = Joi.object({
            email: Joi.string()
                .email()
                .required()
                .messages({
                    'string.empty': 'El email es requerido',
                    'string.email': 'El formato del email no es válido',
                    'any.required': 'El email es requerido'
                }),
            password: Joi.string()
                .required()
                .messages({
                    'string.empty': 'La contraseña es requerida',
                    'any.required': 'La contraseña es requerida'
                })
        });

        const { error } = schema.validate({
            email: this.email,
            password: this.password
        });

        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    static fromRequest(req) {
        const { email, password } = req.body;
        console.log("DEBUG LoginUserDto - email:", email, "password:", password);
        console.log("DEBUG LoginUserDto - req.body:", req.body);
        return new LoginUserDto(email, password);
    }
}

module.exports = LoginUserDto;

