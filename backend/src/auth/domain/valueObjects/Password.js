class Password {
    constructor(value) {
        this.value = this.validate(value);
    }

    validate(password) {
        if (!password) {
            throw new Error('La contraseña es requerida');
        }

        if (password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        if (password.length > 100) {
            throw new Error('La contraseña no puede exceder 100 caracteres');
        }

        return password;
    }

    hasMinimumLength() {
        return this.value.length >= 6;
    }

    hasUpperCase() {
        return /[A-Z]/.test(this.value);
    }

    hasLowerCase() {
        return /[a-z]/.test(this.value);
    }

    hasNumbers() {
        return /\d/.test(this.value);
    }

    hasSpecialChars() {
        return /[!@#$%^&*(),.?":{}|<>]/.test(this.value);
    }

    getStrength() {
        let score = 0;
        
        if (this.hasMinimumLength()) score++;
        if (this.hasUpperCase()) score++;
        if (this.hasLowerCase()) score++;
        if (this.hasNumbers()) score++;
        if (this.hasSpecialChars()) score++;

        if (score <= 2) return 'débil';
        if (score <= 3) return 'media';
        if (score <= 4) return 'fuerte';
        return 'muy fuerte';
    }

    toString() {
        return this.value;
    }
}

module.exports = Password;

