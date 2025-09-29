# Gumroad Payment Debugging Guide

## 🔍 **Step-by-Step Troubleshooting**

### **1. Check Environment Variables**
Make sure these are set in your production environment:
```bash
GUMROAD_PRODUCT_ID=cxmdr
```

### **2. Verify Webhook URL**
In your Gumroad Advanced settings, the ping URL should be:
```
https://yourdomain.com/api/gumroad/simple-webhook
```
(Replace `yourdomain.com` with your actual domain)

### **3. Test Webhook Endpoint**
Test if your webhook is accessible:
```bash
curl -X POST https://yourdomain.com/api/gumroad/simple-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### **4. Check Server Logs**
Look for these log messages:
- `"Gumroad webhook received:"`
- `"User [id] upgraded to Pro via Gumroad"`
- Any error messages

### **5. Manual Test**
Try this test payload to see if the webhook works:
```bash
curl -X POST https://yourdomain.com/api/gumroad/simple-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "sale",
    "product_id": "cxmdr",
    "sale_id": "test-sale-123",
    "custom_fields": {
      "custom1": "your-test-user-id"
    }
  }'
```

## 🚨 **Common Issues**

### **Issue 1: Webhook Not Receiving Data**
- Check if Gumroad is actually sending webhooks
- Verify the ping URL is correct
- Check if your server is accessible from the internet

### **Issue 2: User ID Not Found**
- Make sure the checkout URL includes `custom1=user-id`
- Check if the user ID is being passed correctly

### **Issue 3: Database Error**
- Check if Prisma is connected
- Verify the user exists in the database
- Check for any database permission issues

## 🔧 **Quick Fixes**

### **Fix 1: Check Webhook URL**
Make sure it's exactly:
```
https://yourdomain.com/api/gumroad/simple-webhook
```

### **Fix 2: Test with Real User**
1. Go to `/pro` page
2. Click "Upgrade to Pro"
3. Complete payment
4. Check server logs immediately

### **Fix 3: Manual Database Update**
If webhook isn't working, manually update the user:
```sql
UPDATE "User" SET "isPro" = true WHERE id = 'user-id-here';
```

## 📊 **Debug Information Needed**

Please check and share:
1. **Webhook URL** you set in Gumroad
2. **Server logs** after making a payment
3. **Any error messages** in the console
4. **User ID** that should be getting Pro status

## 🆘 **Still Not Working?**

If it's still not working, we can:
1. **Add more logging** to see what's happening
2. **Create a manual Pro upgrade** button for testing
3. **Use a different webhook approach**
4. **Check Gumroad's webhook documentation**

Let me know what you find in the logs!
