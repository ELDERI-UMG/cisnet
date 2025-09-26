# Database Setup Instructions

## XAMPP MySQL Setup

1. **Start XAMPP Control Panel**
   - Start Apache and MySQL services

2. **Open phpMyAdmin**
   - Go to `http://localhost/phpmyadmin`
   - Login with default credentials (usually no password)

3. **Execute SQL Script**
   - Click on "SQL" tab
   - Copy and paste the content from `database/setup_auth.sql`
   - Click "Go" to execute

4. **Verify Database Setup**
   - Check that `cisnetpos` database is created
   - Verify tables: `users`, `products`, `cart`
   - Default admin user: `eddy@cisnet.com` / `123456`

## API Configuration

- **Port**: 3000
- **Database**: MySQL via XAMPP
- **Host**: localhost
- **User**: root
- **Password**: (empty)
- **Database Name**: cisnetpos

## Testing Authentication

### Login Test
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"eddy@cisnet.com","password":"123456"}'
```

### Register Test
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'
```

### Profile Test (with token)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Start the Server

```bash
cd backend
npm install
npm start
```

The server will run on http://localhost:3000