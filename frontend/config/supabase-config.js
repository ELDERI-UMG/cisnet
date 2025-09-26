// Configuración de Supabase para el frontend
const SUPABASE_CONFIG = {
    url: 'https://nmwdlpaxeeyxlqpswkfc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2RscGF4ZWV5eGxxcHN3a2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzExODEsImV4cCI6MjA3NDQwNzE4MX0.JJzHto6DwhKSn4F0Lw_HZlasq0NS7GQo6oHngJSXt5I'
};

// Inicializar cliente de Supabase
let supabase;

// Función para inicializar Supabase cuando se cargue la librería
function initializeSupabase() {
    if (typeof supabase === 'undefined' && typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase client initialized');
        return supabase;
    }
    return supabase;
}

// Función para obtener el cliente de Supabase
function getSupabaseClient() {
    if (!supabase) {
        supabase = initializeSupabase();
    }
    return supabase;
}

// API Configuration
const API_CONFIG = {
    baseUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:3000'
        : 'https://cisnet-backend.vercel.app',
    endpoints: {
        auth: {
            login: '/api/auth/login',
            register: '/api/auth/register',
            googleVerify: '/api/auth/google-verify',
            googleLogin: '/api/auth/google-login',
            userByEmail: '/api/auth/user-by-email',
            profile: '/api/auth/profile'
        },
        products: {
            list: '/api/products',
            search: '/api/products/search',
            detail: '/api/products'
        },
        cart: {
            get: '/api/cart',
            add: '/api/cart/add',
            update: '/api/cart',
            remove: '/api/cart',
            clear: '/api/cart/clear'
        }
    }
};

// Función para hacer peticiones a la API con autenticación
async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// Exportar para uso global
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
window.API_CONFIG = API_CONFIG;
window.getSupabaseClient = getSupabaseClient;
window.apiRequest = apiRequest;
window.initializeSupabase = initializeSupabase;