export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Bondly - Anonymous Chat with Strangers",
    "description": "Connect with strangers through anonymous chat. Make new friends, have meaningful conversations, and build connections in a safe, anonymous environment.",
    "url": "https://bondly.chat",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "creator": {
      "@type": "Organization",
      "name": "Bondly Team"
    },
    "featureList": [
      "Anonymous Chat",
      "Random Matching",
      "Interest-Based Matching", 
      "Real-time Messaging",
      "Safe & Secure",
      "No Registration Required"
    ],
    "screenshot": "https://bondly.chat/og-image.png",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "inLanguage": "en-US",
    "isAccessibleForFree": true,
    "audience": {
      "@type": "Audience",
      "audienceType": "General Public"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
