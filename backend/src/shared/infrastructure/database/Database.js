const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection({
                host: process.env.DB_HOST || 'localhost',
                user: process.env.DB_USER || 'root',
                password: process.env.DB_PASSWORD || '',
                database: process.env.DB_NAME || 'cisnet'
            });
            console.log('Conectado a la base de datos MySQL');
        } catch (err) {
            console.error('Error conectando a la base de datos:', err.message);
            throw err;
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.end();
            console.log('Conexión a la base de datos cerrada');
        }
    }

    async run(sql, params = []) {
        try {
            const [result] = await this.connection.execute(sql, params);
            return result;
        } catch (err) {
            console.error('Error ejecutando consulta:', err.message);
            throw err;
        }
    }

    async get(sql, params = []) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows[0];
        } catch (err) {
            console.error('Error ejecutando consulta:', err.message);
            throw err;
        }
    }

    async all(sql, params = []) {
        try {
            const [rows] = await this.connection.execute(sql, params);
            return rows;
        } catch (err) {
            console.error('Error ejecutando consulta:', err.message);
            throw err;
        }
    }
}

module.exports = new Database();

