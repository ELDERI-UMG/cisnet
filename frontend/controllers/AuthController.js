class AuthController {
    constructor(user) {
        this.user = user;
    }

    // Show login form
    showLoginForm() {
        return `
            <div class="container">
                <h2>Iniciar Sesión</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn">Iniciar Sesión</button>
                </form>

                <!-- Google Sign-In Button -->
                <div style="margin: 2rem 0; text-align: center;">
                    <div id="google-signin-btn"></div>
                </div>

                <p style="margin-top: 1rem;">
                    ¿No tienes cuenta? <a href="#" id="show-register">Regístrate aquí</a>
                </p>
            </div>
        `;
    }

    // Show register form
    showRegisterForm() {
        return `
            <div class="container">
                <h2>Registrarse</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label for="name">Nombre:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Contraseña:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit" class="btn">Registrarse</button>
                </form>
                <p style="margin-top: 1rem;">
                    ¿Ya tienes cuenta? <a href="#" id="show-login">Inicia sesión aquí</a>
                </p>
            </div>
        `;
    }

    // Handle login form submission
    async handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');

        const result = await this.user.login(email, password);

        if (result.success) {
            this.showMessage('Inicio de sesión exitoso', 'success');
            this.updateNavigation();
            setTimeout(() => {
                if (window.viewManager) {
                    window.viewManager.loadView('products/list');
                }
            }, 1000);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Handle register form submission
    async handleRegister(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        const result = await this.user.register(name, email, password);

        if (result.success) {
            this.showMessage('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            setTimeout(() => {
                if (window.viewManager) {
                    window.viewManager.loadView('auth/login');
                }
            }, 1500);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    // Handle Google authentication
    async handleGoogleAuth(googleUser) {
        const result = await this.user.authenticateWithGoogle(googleUser);

        if (result.success) {
            this.showMessage('¡Autenticación exitosa con Google!', 'success');
            this.updateNavigation();
            setTimeout(() => {
                if (window.viewManager) {
                    window.viewManager.loadView('products/list');
                }
            }, 1000);
        } else {
            this.showMessage('Error al autenticar con Google: ' + result.error, 'error');
        }
    }

    // Handle logout
    async handleLogout() {
        await this.user.logout();
        this.showMessage('Sesión cerrada exitosamente', 'success');
        this.updateNavigation();
        setTimeout(() => {
            if (window.viewManager) {
                window.viewManager.loadView('shared/home');
            }
        }, 1000);
    }

    // Update navigation to show/hide user info
    updateNavigation() {
        const loginLink = document.getElementById('login-link');
        const navMenu = document.querySelector('.nav-menu');

        if (!loginLink || !navMenu) return;

        // Remove existing user elements
        const existingUserProfile = document.getElementById('user-profile');
        const existingDropdown = document.getElementById('profile-dropdown');
        if (existingUserProfile) existingUserProfile.remove();
        if (existingDropdown) existingDropdown.remove();

        if (this.user.isAuthenticated()) {
            // Hide login link
            loginLink.style.display = 'none';

            const userData = this.user.getUserData();

            // Create user profile container
            const userProfile = document.createElement('div');
            userProfile.id = 'user-profile';
            userProfile.style.cssText = `
                position: relative;
                display: inline-block;
                margin-right: 1rem;
            `;

            // Create avatar button
            const avatarBtn = document.createElement('button');
            avatarBtn.style.cssText = `
                background: none;
                border: 2px solid #3498db;
                border-radius: 50%;
                padding: 0;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            `;

            // Add user picture or icon
            if (userData.picture) {
                const img = document.createElement('img');
                img.src = userData.picture;
                img.alt = 'Avatar';
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                `;
                avatarBtn.appendChild(img);
            } else {
                avatarBtn.innerHTML = '👤';
                avatarBtn.style.fontSize = '18px';
            }

            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.id = 'profile-dropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: 50px;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 220px;
                z-index: 1000;
                display: none;
                padding: 0.5rem 0;
            `;

            // User info section
            const userInfo = document.createElement('div');
            userInfo.style.cssText = `
                padding: 1rem;
                border-bottom: 1px solid #eee;
                text-align: center;
            `;
            userInfo.innerHTML = `
                <div style="font-weight: 600; color: #2c3e50; margin-bottom: 0.25rem;">${userData.name}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d;">${userData.email}</div>
            `;

            // Menu options
            const menuOptions = document.createElement('div');
            menuOptions.innerHTML = `
                <button onclick="window.authController.switchUser()" style="
                    width: 100%;
                    background: none;
                    border: none;
                    padding: 0.75rem 1rem;
                    text-align: left;
                    cursor: pointer;
                    color: #2c3e50;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                    🔄 Cambiar de Usuario
                </button>
                <button onclick="window.authController.handleLogout()" style="
                    width: 100%;
                    background: none;
                    border: none;
                    padding: 0.75rem 1rem;
                    text-align: left;
                    cursor: pointer;
                    color: #e74c3c;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background='none'">
                    🚪 Cerrar Sesión
                </button>
            `;

            dropdown.appendChild(userInfo);
            dropdown.appendChild(menuOptions);

            // Toggle dropdown on avatar click
            avatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = dropdown.style.display === 'block';
                dropdown.style.display = isVisible ? 'none' : 'block';
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdown.style.display = 'none';
            });

            userProfile.appendChild(avatarBtn);
            userProfile.appendChild(dropdown);

            // Insert before login link
            navMenu.insertBefore(userProfile, loginLink);

        } else {
            // Show login link
            loginLink.style.display = 'inline';
            loginLink.textContent = 'Iniciar Sesión';
        }
    }

    // Switch user (logout and redirect to login)
    async switchUser() {
        await this.user.logout();
        this.showMessage('Sesión cerrada. Puedes iniciar sesión con otra cuenta.', 'success');
        this.updateNavigation();
        setTimeout(() => {
            if (window.viewManager) {
                window.viewManager.loadView('auth/login');
            }
        }, 1000);
    }

    // Show message
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);

            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
}