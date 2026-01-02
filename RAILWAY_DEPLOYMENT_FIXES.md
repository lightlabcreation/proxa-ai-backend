# Railway Deployment Fixes - Production Issues Resolved

## 🔧 Issues Fixed

### 1. **CRITICAL: JWT Token Expiry** ✅
**Problem**: Access tokens expired in only 1 minute (`1m`), causing immediate authentication failures in production.

**Fix**: Changed token expiry from `1m` to `24h` in `src/services/generateToken.js`

**Why it worked locally**: Local development might have had different token refresh behavior or timing.

---

### 2. **Database SSL Configuration** ✅
**Problem**: Railway MySQL requires SSL connections, but Sequelize and mysql2Connection were not configured for SSL.

**Fixes**:
- Added SSL configuration to `config/config.js` (Sequelize)
- Added SSL configuration to `src/utils/mysql2Connection.js` (mysql2 pool)
- Both now use `rejectUnauthorized: false` for Railway's self-signed certificates

**Why it worked locally**: Local MySQL doesn't require SSL.

---

### 3. **Environment Variable Compatibility** ✅
**Problem**: Railway may use `DB_USER` instead of `DB_USERNAME`.

**Fix**: Updated both database connection files to support both `DB_USERNAME` and `DB_USER`:
```javascript
const dbUsername = DB_USERNAME || DB_USER;
```

---

### 4. **Package.json Start Script** ✅
**Problem**: Start script pointed to `index.js` but main file is `procurement_server.js`.

**Fix**: Updated `package.json`:
```json
"start": "node procurement_server.js"
```

**Why it worked locally**: You might have been running `node procurement_server.js` directly.

---

### 5. **Port Configuration** ✅
**Problem**: Server used `process.env.PORT` without fallback.

**Fix**: Added fallback:
```javascript
const PORT = process.env.PORT || 7174;
```

---

### 6. **Enhanced Logging** ✅
**Problem**: No visibility into authentication failures in production.

**Fix**: Added strategic logging in `src/middleware/authorize.js`:
- Logs when authorization header is missing
- Logs token verification errors
- Logs successful authentication with user details
- Logs invalid token payloads

---

### 7. **Database Connection Logging** ✅
**Problem**: No visibility into database connection status.

**Fix**: Enhanced database connection logging in `config/config.js`:
- Shows successful connection with database name and host
- Better error messages for connection failures

---

## 📋 Railway Environment Variables Checklist

Ensure these environment variables are set in Railway:

### Required Variables:
```
✅ PORT (automatically set by Railway)
✅ DB_HOST (Railway MySQL host)
✅ DB_NAME (your database name)
✅ DB_USER or DB_USERNAME (Railway MySQL username)
✅ DB_PASSWORD (Railway MySQL password)
✅ ACCESS_SECRET_KEY (JWT access token secret - MUST match local)
✅ REFRESH_SECRET_KEY (JWT refresh token secret - MUST match local)
```

### Optional Variables:
```
NODE_ENV=production (recommended)
```

### ⚠️ IMPORTANT NOTES:
1. **ACCESS_SECRET_KEY** and **REFRESH_SECRET_KEY** MUST be the same values as your local `.env` file
2. Railway sets `PORT` automatically - don't override it
3. Railway MySQL connection string format:
   - `DB_HOST`: Usually something like `containers-us-west-xxx.railway.app`
   - `DB_USER`: Usually `root`
   - `DB_NAME`: Your database name
   - `DB_PASSWORD`: Provided by Railway

---

## 🔍 How to Verify Fixes

### 1. Check Railway Logs:
After deployment, check Railway logs for:
- ✅ "Connection has been established successfully with Database!"
- ✅ "Server is running for procxa at port [PORT]"
- ✅ "[AUTH] User authenticated:" messages on protected routes

### 2. Test Authentication:
1. Login should work (already working)
2. Protected GET/POST routes should now return data instead of 401/403
3. Check browser Network tab - Authorization header should be sent correctly

### 3. Common Issues to Check:
- If still getting 401: Check Railway logs for "[AUTH]" messages
- If still getting empty data: Check database connection logs
- If getting 403 SuperAdmin: Verify `req.user.userType === 'superadmin'` in logs

---

## 🚀 Deployment Steps

1. **Commit all changes**
2. **Push to Railway** (or Railway auto-deploys from Git)
3. **Verify Environment Variables** in Railway dashboard
4. **Check Railway Logs** for startup messages
5. **Test Login** - should work
6. **Test Protected Routes** - should now return data

---

## 📝 Files Modified

1. `src/services/generateToken.js` - Token expiry fix
2. `config/config.js` - SSL + env var support + logging
3. `src/utils/mysql2Connection.js` - SSL + env var support
4. `procurement_server.js` - Port fallback + logging
5. `src/middleware/authorize.js` - Enhanced logging
6. `package.json` - Start script fix

---

## 🎯 Why Local Worked But Production Failed

1. **Token Expiry**: 1-minute tokens expired before requests completed in production (network latency)
2. **SSL**: Local MySQL doesn't require SSL; Railway MySQL requires it
3. **Environment Variables**: Railway uses different env var names (`DB_USER` vs `DB_USERNAME`)
4. **Start Script**: You likely ran `node procurement_server.js` directly locally
5. **Network Latency**: Production has more latency, making 1-minute tokens expire faster

---

## ✅ Expected Behavior After Fixes

- ✅ Login API works (already working)
- ✅ JWT tokens last 24 hours (not 1 minute)
- ✅ Protected routes return data (not empty/401/403)
- ✅ Database connects with SSL
- ✅ Authentication middleware logs help debug issues
- ✅ SuperAdmin routes work correctly

---

## 🆘 Troubleshooting

If issues persist:

1. **Check Railway Logs** for:
   - Database connection errors
   - Authentication errors
   - Token verification errors

2. **Verify Environment Variables**:
   - All required vars are set
   - No typos in variable names
   - Values match local `.env` (for secrets)

3. **Test Token Manually**:
   - Copy token from browser localStorage
   - Decode at jwt.io to verify payload structure
   - Check expiry time

4. **Check CORS**:
   - Frontend domain is allowed
   - Authorization header is sent correctly

---

## 📞 Support

If issues persist after these fixes, check Railway logs and share:
- Authentication log messages
- Database connection status
- Any error messages from protected routes

