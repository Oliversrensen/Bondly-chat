# Gumroad Environment Variables Setup

## 🎯 **Your Product Details**

Based on your Gumroad product: [https://bondlysupporter.gumroad.com/l/cxmdr](https://bondlysupporter.gumroad.com/l/cxmdr)

- **Product ID**: `cxmdr`
- **Price**: €5.99/month
- **Product Name**: Bondly Pro

## 🔧 **Environment Variables to Set**

Add these to your `.env.local` and production environment:

```bash
# Gumroad Configuration
GUMROAD_PRODUCT_ID=cxmdr
GUMROAD_WEBHOOK_SECRET=your-webhook-secret-here
```

## 📋 **Next Steps**

1. **Get Webhook Secret**:
   - Go to your Gumroad dashboard
   - Navigate to Settings > Webhooks
   - Add webhook URL: `https://yourdomain.com/api/gumroad/webhook`
   - Copy the webhook secret

2. **Test the Integration**:
   - Set the environment variables
   - Deploy to production
   - Test the checkout flow

3. **Verify Webhook**:
   - Make a test purchase
   - Check if user gets Pro status
   - Monitor server logs

## ✅ **Ready to Go!**

Your Gumroad integration is configured with:
- ✅ Product ID: `cxmdr`
- ✅ Checkout API: `/api/gumroad/checkout`
- ✅ Webhook handler: `/api/gumroad/webhook`
- ✅ Success page: `/pro/success`

The integration will redirect users to: `https://bondlysupporter.gumroad.com/l/cxmdr?wanted=true&email=user@example.com&custom1=user-id`
