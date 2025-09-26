const Email = require('../valueObjects/Email');
const Password = require('../valueObjects/Password');

class User {
    constructor(id, name, email, passwordHash, createdAt = null, updatedAt = null) {
        this.id = id;
        this.name = name;
        this.email = new Email(email);
        this.passwordHash = passwordHash;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    static create(name, email, password) {
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }

        if (name.trim().length < 2) {
            throw new Error('El nombre debe tener al menos 2 caracteres');
        }

        const emailVO = new Email(email);
        const passwordVO = new Password(password);

        return new User(null, name.trim(), emailVO.value, null);
    }

    updatePassword(newPassword) {
        const passwordVO = new Password(newPassword);
        this.updatedAt = new Date();
        return this;
    }

    updateProfile(name, email) {
        if (name && name.trim().length >= 2) {
            this.name = name.trim();
        }
        
        if (email) {
            this.email = new Email(email);
        }
        
        this.updatedAt = new Date();
        return this;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email.value,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    getEmailValue() {
        return this.email.value;
    }
}

module.exports = User;

