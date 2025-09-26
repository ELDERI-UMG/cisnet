// Script para debug del problema de URL duplicada

console.log('🔍 Debug del problema de URL...');

// URLs que estamos guardando en la base de datos
const savedUrls = [
    'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi?product=7',
    'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi?product=8'
];

console.log('URLs guardadas en BD:', savedUrls);

// Simular processExternalUrl de media-config.js
function processExternalUrl(url) {
    console.log('Procesando URL:', url);

    // Google Drive - detectar si es carpeta o archivo individual
    if (url.includes('drive.google.com')) {
        // Si es una carpeta (folders), abrir la carpeta en una nueva pestaña
        if (url.includes('/folders/')) {
            console.log('Es una carpeta, devolviendo tal como está');
            return url;
        }
        // Si es un archivo individual, convertir a enlace de descarga directa
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (fileId) {
            console.log('Encontrado fileId:', fileId[1]);
            return `https://drive.google.com/uc?export=download&id=${fileId[1]}`;
        }
    }

    console.log('No hay match, devolviendo tal como está');
    return url;
}

// Simular generateViewUrl
function generateViewUrl(fileId) {
    console.log('Generando view URL con fileId:', fileId);
    return `https://drive.google.com/file/d/${fileId}/view`;
}

// Test 1: URL de carpeta normal
console.log('\n--- Test 1: URL de carpeta ---');
const url1 = savedUrls[0];
const processed1 = processExternalUrl(url1);
console.log('Input:', url1);
console.log('Output:', processed1);

// Test 2: Si pasáramos esta URL a generateViewUrl (que es lo que estaría mal)
console.log('\n--- Test 2: URL pasada a generateViewUrl (INCORRECTO) ---');
const badResult = generateViewUrl(url1);
console.log('Input a generateViewUrl:', url1);
console.log('Output (MAL FORMADO):', badResult);

// Test 3: Uso correcto con fileId real
console.log('\n--- Test 3: Uso correcto con fileId real ---');
const realFileId = '1ABC123DEF456'; // Un ID real de archivo
const goodResult = generateViewUrl(realFileId);
console.log('Input fileId real:', realFileId);
console.log('Output (CORRECTO):', goodResult);

console.log('\n🎯 Conclusión: El problema está en pasar URLs completas a generateViewUrl en lugar de IDs de archivo');