# 🔐 How to Get Pairing Code on Panel

## Method 1: Using Environment Variable (Recommended for Panels)

### Step 1: Add Your Phone Number
In your panel's environment variables, add:
```
PHONE_NUMBER=919876543210
```
(Use your WhatsApp number with country code, no + or spaces)

### Step 2: Run Session Generator
In panel terminal:
```bash
npm run session
```

### Step 3: Get Pairing Code
You'll see:
```
╔═══════════════════════════════════════════════╗
║                                               ║
║         PAIRING CODE: ABCD-EFGH              ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### Step 4: Connect WhatsApp
1. Open WhatsApp
2. Settings → Linked Devices
3. Link with phone number
4. Enter code: ABCD-EFGH

### Step 5: Get SESSION_ID
After connecting, you'll see:
```
✅ SESSION ID GENERATED!
📋 SESSION_ID Preview: eyJjcmVkcyI6eyJub2...
```

### Step 6: Copy SESSION_ID
```bash
# In panel terminal
cat SESSION_ID.txt
```
Copy the entire output and add to environment variables:
```
SESSION_ID=eyJjcmVkcyI6eyJub2...
```

### Step 7: Start Bot
```bash
npm start
```

---

## Method 2: Hardcode Phone Number (Quick & Easy)

### Edit session.js
Change this line:
```javascript
const PHONE_NUMBER = process.env.PHONE_NUMBER || '919876543210'; // Add your number here
```

Then run:
```bash
npm run session
```

---

## Method 3: Interactive Input (Local Computer Only)

If running on your computer with terminal:
```bash
npm run session
# It will ask for your number
Enter your WhatsApp number: 919876543210
```

---

## 🚀 Complete Panel Deployment Steps

### 1. Upload Files
Upload all files to panel

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Phone Number
Add to environment variables:
```
PHONE_NUMBER=919876543210
```

### 4. Generate Session
```bash
npm run session
```

### 5. Copy SESSION_ID
```bash
cat SESSION_ID.txt
# Copy entire output
```

### 6. Add SESSION_ID
Add to environment variables:
```
SESSION_ID=your_copied_session_id_here
```

### 7. Start Bot
```bash
npm start
```

---

## 📱 Panel-Specific Instructions

### Heroku
```bash
# Set phone number
heroku config:set PHONE_NUMBER=919876543210

# Run session generator
heroku run npm run session

# Copy SESSION_ID from logs
heroku config:set SESSION_ID="your_session_id"

# Start bot
heroku restart
```

### Railway
```bash
# In Railway terminal
npm run session

# Copy SESSION_ID
cat SESSION_ID.txt

# Add to environment variables in Railway dashboard
```

### Render
```bash
# In Render shell
npm run session

# Copy output
cat SESSION_ID.txt

# Add to environment variables
```

### Spaceify/Generic Panel
```bash
# In panel terminal/console
npm run session

# View SESSION_ID
cat SESSION_ID.txt

# Copy and add to panel environment variables
```

---

## 🔍 Troubleshooting

### "No phone number provided"
**Solution:** Add PHONE_NUMBER to environment variables or edit session.js

### "Invalid phone number"
**Solution:** Use format: CountryCode + Number (e.g., 919876543210)
- No + symbol
- No spaces
- No dashes

### "Pairing code not appearing"
**Solution:** 
1. Check internet connection
2. Wait 5-10 seconds
3. Try again

### "Code expired"
**Solution:** 
1. Run `npm run session` again
2. Use code within 20 seconds

### "Session not saving"
**Solution:**
1. Check file permissions
2. Ensure auth_session folder exists
3. Check disk space

---

## 💡 Tips

1. ✅ **Keep SESSION_ID safe** - It's like your password
2. ✅ **One SESSION_ID = One bot instance**
3. ✅ **Regenerate if bot disconnects**
4. ✅ **Never share SESSION_ID publicly**
5. ✅ **Backup SESSION_ID** before changes
6. ✅ **Use same number for PHONE_NUMBER and OWNER_NUMBER**

---

## 📋 Quick Reference

### Generate Session
```bash
npm run session
```

### View SESSION_ID
```bash
cat SESSION_ID.txt
```

### Start Bot
```bash
npm start
```

### Environment Variables Needed
```
PHONE_NUMBER=919876543210    # For session generation
SESSION_ID=your_session      # After generation
OWNER_NUMBER=919876543210    # Same as PHONE_NUMBER
PREFIX=.
BOT_NAME=0xS Bot
MODE=public
```
