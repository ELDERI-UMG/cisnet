class Email {
    constructor(value) {
        this.value = this.validate(value);
    }

    validate(email) {
        if (!email) {
            throw new Error('El email es requerido');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(email)) {
            throw new Error('El formato del email no es válido');
        }

        if (email.length > 100) {
            throw new Error('El email no puede exceder 100 caracteres');
        }

        return email.toLowerCase().trim();
    }

    equals(other) {
        return other instanceof Email && this.value === other.value;
    }

    toString() {
        return this.value;
    }
}

module.exports = Email;

