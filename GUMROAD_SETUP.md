# Gumroad Payment Integration Setup

## 🚀 **Quick Setup Guide**

### **1. Create Gumroad Account & Product**

1. **Sign up** at [gumroad.com](https://gumroad.com)
2. **Create a new product**:
   - Product name: "Bondly Pro Subscription"
   - Price: $5.99 (or your preferred price)
   - Product type: "Subscription" (monthly)
   - Description: "Premium features for Bondly anonymous chat app"

3. **Get your Product ID**:
   - Go to your product page
   - Copy the product ID from the URL (e.g., `https://gumroad.com/l/PRODUCT_ID`)

### **2. Configure Webhooks**

1. **Go to Settings > Webhooks** in your Gumroad dashboard
2. **Add webhook URL**: `https://yourdomain.com/api/gumroad/webhook`
3. **Select events**: `sale`, `refund`, `dispute`
4. **Copy the webhook secret** (you'll need this for environment variables)

### **3. Environment Variables**

Add these to your `.env.local` and production environment:

```bash
# Gumroad Configuration
GUMROAD_PRODUCT_ID=your-product-id-here
GUMROAD_WEBHOOK_SECRET=your-webhook-secret-here

# Optional: For testing
GUMROAD_TEST_MODE=true
```

### **4. Test the Integration**

1. **Deploy your changes**
2. **Test the checkout flow**:
   - Go to `/pro` page
   - Click "Upgrade to Pro"
   - Complete payment on Gumroad
   - Check if user gets Pro status

3. **Test webhook**:
   - Check server logs for webhook events
   - Verify user gets `isPro: true` in database

## 🔧 **How It Works**

### **Checkout Flow**
1. User clicks "Upgrade to Pro" on `/pro` page
2. App calls `/api/gumroad/checkout`
3. User is redirected to Gumroad checkout with their email pre-filled
4. User completes payment on Gumroad
5. Gumroad sends webhook to `/api/gumroad/webhook`
6. App updates user's Pro status in database

### **Webhook Events**
- **`sale`**: User completes payment → Set `isPro: true`
- **`refund`**: User gets refund → Set `isPro: false`
- **`dispute`**: Payment disputed → Set `isPro: false`

## 📊 **Database Schema**

The integration uses your existing `Subscription` table:

```sql
model Subscription {
  id               String   @id @default(cuid())
  userId           String
  status           String   // "active", "cancelled"
  priceId          String   // Gumroad product ID
  currentPeriodEnd DateTime // 30 days from purchase
  user             User     @relation(fields: [userId], references: [id])
}
```

## 🛡️ **Security Features**

### **Webhook Verification**
- Verifies webhook signature using HMAC-SHA256
- Prevents unauthorized webhook calls
- Logs all webhook events for debugging

### **User Identification**
- Uses `custom1` field to pass user ID
- Pre-fills user email for better UX
- Validates user exists before processing

## 🧪 **Testing**

### **Test Mode**
Set `GUMROAD_TEST_MODE=true` in environment variables for testing.

### **Test Webhook**
You can test webhooks using:
```bash
curl -X POST https://yourdomain.com/api/gumroad/webhook \
  -H "Content-Type: application/json" \
  -H "x-gumroad-signature: your-test-signature" \
  -d '{"event_type": "sale", "product_id": "your-product-id", "custom_fields": {"custom1": "test-user-id"}}'
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Webhook not receiving events**:
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check server logs for errors

2. **User not getting Pro status**:
   - Check webhook is being called
   - Verify user ID is being passed correctly
   - Check database for subscription record

3. **Checkout not working**:
   - Verify product ID is correct
   - Check if product is published on Gumroad
   - Test with different browsers

### **Debug Logs**
Check your server logs for:
- Webhook events received
- User ID extraction
- Database updates
- Error messages

## 💰 **Pricing & Fees**

- **Gumroad fees**: 5% + $0.30 per transaction
- **Example**: $5.99 sale = $5.99 - $0.60 = $5.39 net
- **No monthly fees** or setup costs

## 🔄 **Migration from Lemon Squeezy**

If you're migrating from Lemon Squeezy:

1. **Keep both systems** running temporarily
2. **Test Gumroad** with a few users first
3. **Update Pro page** to use Gumroad
4. **Monitor** both systems for a week
5. **Remove** Lemon Squeezy integration once confident

## 📈 **Analytics & Monitoring**

### **Track These Metrics**
- Conversion rate (visits to Pro page vs purchases)
- Webhook success rate
- User Pro status accuracy
- Revenue per user

### **Gumroad Dashboard**
- Monitor sales in real-time
- Track refunds and disputes
- View customer details
- Export sales data

## 🎯 **Next Steps**

1. **Set up Gumroad account** and create product
2. **Add environment variables** to your hosting platform
3. **Deploy the changes** to production
4. **Test the complete flow** with a real payment
5. **Monitor webhooks** and user Pro status
6. **Update your marketing** to reflect new payment system

---

**Need help?** Check the Gumroad documentation or contact their support team.
