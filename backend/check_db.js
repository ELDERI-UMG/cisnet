const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        console.log('🔍 Verificando base de datos...');
        
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cisnetpos'
        });

        // Check users table
        const [users] = await connection.execute('SELECT id, name, email FROM users');
        console.log('\n👥 Usuarios en la base de datos:');
        users.forEach(user => {
            console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
        });

        // Check if any user has the correct password hash
        const [userWithPass] = await connection.execute('SELECT id, name, email, password FROM users WHERE email = ?', ['eddy@example.com']);
        if (userWithPass.length > 0) {
            console.log(`\n🔑 Usuario eddy@example.com encontrado con password hash: ${userWithPass[0].password.substring(0, 20)}...`);
        } else {
            console.log('\n❌ Usuario eddy@example.com NO encontrado');
        }

        await connection.end();
        console.log('✅ Verificación de base de datos completada');

    } catch (error) {
        console.error('❌ Error verificando base de datos:', error);
    }
}

checkDatabase();