const Joi = require('joi');

class RegisterUserDto {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.validate();
    }

    validate() {
        const schema = Joi.object({
            name: Joi.string()
                .min(2)
                .max(100)
                .required()
                .messages({
                    'string.empty': 'El nombre es requerido',
                    'string.min': 'El nombre debe tener al menos 2 caracteres',
                    'string.max': 'El nombre no puede exceder 100 caracteres',
                    'any.required': 'El nombre es requerido'
                }),
            email: Joi.string()
                .email()
                .max(100)
                .required()
                .messages({
                    'string.empty': 'El email es requerido',
                    'string.email': 'El formato del email no es válido',
                    'string.max': 'El email no puede exceder 100 caracteres',
                    'any.required': 'El email es requerido'
                }),
            password: Joi.string()
                .min(6)
                .max(100)
                .required()
                .messages({
                    'string.empty': 'La contraseña es requerida',
                    'string.min': 'La contraseña debe tener al menos 6 caracteres',
                    'string.max': 'La contraseña no puede exceder 100 caracteres',
                    'any.required': 'La contraseña es requerida'
                })
        });

        const { error } = schema.validate({
            name: this.name,
            email: this.email,
            password: this.password
        });

        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    static fromRequest(req) {
        const { name, email, password } = req.body;
        return new RegisterUserDto(name, email, password);
    }
}

module.exports = RegisterUserDto;

