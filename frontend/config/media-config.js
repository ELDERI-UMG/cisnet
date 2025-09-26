// Configuración centralizada de archivos y medios
class MediaConfig {
    constructor() {
        // Configuración base - cambiar según entorno
        this.baseUrl = this.getBaseUrl();
        this.downloadPath = '/CisnetPOS/downloads/';
        this.videosPath = 'https://www.youtube.com/watch?v='; // Cambiar por tu servidor de videos
        
        // Configuración por producto - Archivos individuales por producto (será gestionado por el backend)
        this.productMedia = {
            1: {
                name: 'Sistema de Facturación',
                zipFile: 'sistema_facturacion.zip',
                zipUrl: null, // Será proporcionado por el backend según permisos del usuario
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'Q7YvKOQ7ROQ', // Tutorial de Facturación Electrónica
                videoUrl: null
            },
            2: {
                name: 'Sistema POS',
                zipFile: 'sistema_pos.zip',
                zipUrl: null, // Será proporcionado por el backend según permisos del usuario
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'FdHqjhYNW8Q', // Tutorial de Punto de Venta
                videoUrl: null
            },
            3: {
                name: 'Sistema de Inventarios',
                zipFile: 'sistema_inventarios.zip',
                zipUrl: null, // Será proporcionado por el backend según permisos del usuario
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'pQ7YvKOQ7ROQ', // Tutorial de Control de Inventarios
                videoUrl: null
            },
            7: {
                name: 'Microsoft Office 365',
                zipFile: 'office365_v2024.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'YsKA18WqBKw', // Microsoft Office 365 Tutorial
                videoUrl: null
            },
            8: {
                name: 'Adobe Photoshop',
                zipFile: 'photoshop_2024.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'wAxdwVtewuE', // Photoshop Tutorial for Beginners
                videoUrl: null
            },
            9: {
                name: 'Visual Studio Code',
                zipFile: 'vscode_latest.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'qvQNgur2KCI', // VS Code Tutorial for Beginners
                videoUrl: null
            },
            10: {
                name: 'Windows 11 Pro',
                zipFile: 'windows11_pro.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'tP4n4WBBNeY', // Windows 11 New Features
                videoUrl: null
            },
            11: {
                name: 'AutoCAD 2024',
                zipFile: 'autocad_2024.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'uilGYrBNV3g', // AutoCAD Complete Tutorial
                videoUrl: null
            },
            12: {
                name: 'Minecraft Java Edition',
                zipFile: 'minecraft_java.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'MmB9b5njVbA', // Minecraft Beginner's Guide
                videoUrl: null
            },
            13: {
                name: 'Norton 360 Deluxe',
                zipFile: 'norton360_deluxe.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: '2HKvK6prfbc', // Norton 360 Setup Guide
                videoUrl: null
            },
            14: {
                name: 'Zoom Pro',
                zipFile: 'zoom_pro.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'V1MGCyJsXVo', // How to Use Zoom
                videoUrl: null
            },
            15: {
                name: 'Adobe Creative Suite',
                zipFile: 'adobe_creative_suite.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: '1WjQdmf2BMg', // Adobe Creative Suite Overview
                videoUrl: null
            },
            16: {
                name: 'IntelliJ IDEA Ultimate',
                zipFile: 'intellij_ultimate.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'yefmcX57Eyg', // IntelliJ IDEA Tutorial
                videoUrl: null
            },
            17: {
                name: 'Spotify Premium',
                zipFile: 'spotify_premium.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'QpWABxd18tQ', // Spotify Premium Features
                videoUrl: null
            },
            18: {
                name: 'VMware Workstation Pro',
                zipFile: 'vmware_workstation.zip',
                zipUrl: 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi',
                isExternalUrl: true,
                requiresPermission: true,
                videoId: 'wX75Z-4MEoM', // VMware Workstation Tutorial
                videoUrl: null
            }
        };
        
        // Generar URLs completas
        this.initializeUrls();
    }
    
    getBaseUrl() {
        // Detectar automáticamente el entorno
        const hostname = window.location.hostname;
        const port = window.location.port;
        const protocol = window.location.protocol;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Desarrollo local
            return `${protocol}//${hostname}${port ? ':' + port : ''}`;
        } else {
            // Producción - cambiar por tu dominio
            return 'https://tu-dominio-produccion.com';
        }
    }
    
    initializeUrls() {
        Object.keys(this.productMedia).forEach(productId => {
            const product = this.productMedia[productId];
            
            // Generar URL de video según el proveedor
            if (product.videoId) {
                product.videoUrl = this.generateVideoUrl(product.videoId);
            }
        });
    }
    
    generateVideoUrl(videoId) {
        // Aquí puedes cambiar el proveedor de videos
        // YouTube: https://www.youtube.com/watch?v={videoId}
        // Vimeo: https://vimeo.com/{videoId}
        // Tu servidor: https://tu-servidor.com/videos/{videoId}
        
        return `${this.videosPath}${videoId}`;
    }
    
    // Obtener información del producto
    async getProductMedia(productId) {
        const product = this.productMedia[productId];
        if (!product) {
            console.warn(`⚠️ No media config found for product ${productId}`);
            return null;
        }

        // Si requiere permisos, obtener URL del backend
        let downloadUrl = null;
        if (product.requiresPermission) {
            try {
                // Get token for authenticated request
                const token = window.authController?.user?.getToken();
                if (token) {
                    const response = await fetch('http://localhost:3000/api/purchases/get-download-url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ productId: parseInt(productId) })
                    });

                    const result = await response.json();
                    if (result.success && result.downloadUrl) {
                        downloadUrl = result.downloadUrl;
                    }
                }
            } catch (error) {
                console.error(`❌ Error getting download URL for product ${productId}:`, error);
            }
        } else {
            // Generar URL de descarga según si es externa o local
            if (product.isExternalUrl && product.zipUrl) {
                downloadUrl = this.processExternalUrl(product.zipUrl);
            } else {
                downloadUrl = `${this.baseUrl}${this.downloadPath}${product.zipFile}`;
            }
        }

        return {
            name: product.name,
            downloadUrl: downloadUrl,
            videoUrl: product.videoUrl,
            zipFile: product.zipFile,
            videoId: product.videoId,
            isExternalUrl: product.isExternalUrl,
            requiresPermission: product.requiresPermission,
            originalUrl: product.zipUrl
        };
    }
    
    // Procesar URLs externas (Google Drive, OneDrive, etc.)
    processExternalUrl(url) {
        // Google Drive - detectar si es carpeta o archivo individual
        if (url.includes('drive.google.com')) {
            // Si es una carpeta (folders), abrir la carpeta en una nueva pestaña
            if (url.includes('/folders/')) {
                return url;
            }
            // Si es un archivo individual, convertir a enlace de descarga directa
            const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
            if (fileId) {
                return `https://drive.google.com/uc?export=download&id=${fileId[1]}`;
            }
        }

        // OneDrive - convertir a enlace de descarga directa
        if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
            if (url.includes('?')) {
                return url.replace('?', '?download=1&');
            } else {
                return url + '?download=1';
            }
        }

        // Dropbox - convertir a enlace de descarga directa
        if (url.includes('dropbox.com')) {
            return url.replace('?dl=0', '?dl=1');
        }

        // Para otras URLs, devolver tal como está
        return url;
    }
    
    // Obtener solo la URL de descarga
    getDownloadUrl(productId) {
        const media = this.getProductMedia(productId);
        return media ? media.downloadUrl : null;
    }
    
    // Obtener solo la URL del video
    getVideoUrl(productId) {
        const media = this.getProductMedia(productId);
        return media ? media.videoUrl : null;
    }
    
    // Obtener nombre del producto
    getProductName(productId) {
        const media = this.getProductMedia(productId);
        return media ? media.name : `Producto ${productId}`;
    }
    
    // Verificar si existe archivo ZIP para el producto
    hasZipFile(productId) {
        const media = this.getProductMedia(productId);
        return media && media.zipFile;
    }
    
    // Verificar si existe video para el producto
    hasVideo(productId) {
        const media = this.getProductMedia(productId);
        return media && media.videoUrl;
    }
    
    // Método para actualizar configuración en producción
    updateConfig(newConfig) {
        Object.assign(this.productMedia, newConfig);
        this.initializeUrls();
        console.log('📝 Media config updated:', newConfig);
    }
    
    // Debug: mostrar toda la configuración
    showConfig() {
        console.log('🔧 Media Configuration:');
        console.log('Base URL:', this.baseUrl);
        console.log('Download Path:', this.downloadPath);
        console.log('Videos Path:', this.videosPath);
        console.log('Products:', this.productMedia);
    }
}

// Crear instancia global
window.mediaConfig = new MediaConfig();

// Debug en desarrollo
if (window.location.hostname === 'localhost') {
    console.log('🎬 MediaConfig initialized for DEVELOPMENT');
    // window.mediaConfig.showConfig(); // Uncomment para ver config completa
} else {
    console.log('🎬 MediaConfig initialized for PRODUCTION');
}