# Facebook Authentication Setup

This guide will help you set up Facebook authentication for your Bondly chat app.

## 1. Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as the app type
4. Fill in your app details:
   - **App Name**: Bondly Chat (or your preferred name)
   - **App Contact Email**: Your email address
   - **App Purpose**: Select "Other" and describe your app

## 2. Configure Facebook Login

1. In your Facebook app dashboard, go to "Products" → "Facebook Login" → "Settings"
2. Add your domain to "Valid OAuth Redirect URIs":
   - **Development**: `http://localhost:3000/api/auth/callback/facebook`
   - **Production**: `https://yourdomain.com/api/auth/callback/facebook`

## 3. Get Your App Credentials

1. Go to "Settings" → "Basic" in your Facebook app
2. Copy your **App ID** and **App Secret**
3. Add these to your `.env` file:

```env
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

## 4. Configure App Permissions

1. Go to "Products" → "Facebook Login" → "Permissions and Features"
2. Add these permissions:
   - `email` - Get user's email address
   - `public_profile` - Get user's basic profile information

## 5. Test Your Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Click "Continue with Facebook"
4. You should see the Facebook login dialog

## 6. Production Setup

1. Add your production domain to Facebook app settings
2. Update the redirect URI to your production domain
3. Make sure your production environment has the correct environment variables

## Troubleshooting

### Common Issues

1. **"App Not Setup" Error**
   - Make sure your Facebook app is in "Live" mode
   - Check that your domain is added to "App Domains"

2. **"Invalid Redirect URI" Error**
   - Verify the redirect URI matches exactly in Facebook app settings
   - Check for trailing slashes or HTTP vs HTTPS

3. **"App Secret" Error**
   - Double-check your App Secret in the `.env` file
   - Make sure there are no extra spaces or quotes

### Required Environment Variables

```env
# Facebook OAuth
FACEBOOK_CLIENT_ID="your-facebook-app-id"
FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"
```

## Security Notes

- Never commit your App Secret to version control
- Use different Facebook apps for development and production
- Regularly rotate your App Secret
- Monitor your app usage in Facebook Developer Console

## Support

If you encounter issues:
1. Check the Facebook Developer Console for error logs
2. Verify all environment variables are set correctly
3. Test with a fresh Facebook account
4. Check the NextAuth.js documentation for Facebook provider details
