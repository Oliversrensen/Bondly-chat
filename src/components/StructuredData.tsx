export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://bondly.chat/#webapp",
        "name": "Bondly - Anonymous Chat App",
        "description": "Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections, and discover amazing conversations.",
        "url": "https://bondly.chat",
        "applicationCategory": "SocialNetworkingApplication",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0",
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "inLanguage": "en-US",
        "isAccessibleForFree": true,
        "screenshot": "https://bondly.chat/og-image.png",
        "featureList": [
          "Anonymous Chat with Strangers",
          "Random Matching Algorithm",
          "Interest-Based Matching", 
          "Real-time Messaging",
          "Safe & Secure Platform",
          "No Registration Required",
          "Google Sign-in Authentication",
          "Mobile Responsive Design",
          "Pro Features Available",
          "Gender Filtering (Pro)",
          "Custom Display Names (Pro)",
          "Priority Matching (Pro)"
        ],
        "creator": {
          "@type": "Organization",
          "@id": "https://bondly.chat/#organization",
          "name": "Bondly Team",
          "url": "https://bondly.chat"
        },
        "publisher": {
          "@type": "Organization",
          "@id": "https://bondly.chat/#organization"
        },
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Anonymous Chat",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          {
            "@type": "Offer",
            "name": "Bondly Pro Subscription",
            "price": "9.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "description": "Premium features including custom display names, gender filtering, and priority matching"
          }
        ],
        "audience": {
          "@type": "Audience",
          "audienceType": "General Public",
          "geographicArea": {
            "@type": "Country",
            "name": "Worldwide"
          }
        },
        "potentialAction": [
          {
            "@type": "UseAction",
            "name": "Start Anonymous Chat",
            "target": "https://bondly.chat/chat",
            "object": {
              "@type": "WebPage",
              "name": "Chat Room",
              "url": "https://bondly.chat/chat"
            }
          },
          {
            "@type": "RegisterAction",
            "name": "Sign Up for Bondly",
            "target": "https://bondly.chat/auth",
            "object": {
              "@type": "WebPage",
              "name": "Sign Up",
              "url": "https://bondly.chat/auth"
            }
          }
        ]
      },
      {
        "@type": "Organization",
        "@id": "https://bondly.chat/#organization",
        "name": "Bondly",
        "url": "https://bondly.chat",
        "logo": {
          "@type": "ImageObject",
          "url": "https://bondly.chat/logo.svg",
          "width": 100,
          "height": 100
        },
        "sameAs": [
          "https://twitter.com/bondly_chat"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://bondly.chat/#website",
        "url": "https://bondly.chat",
        "name": "Bondly - Anonymous Chat App",
        "description": "The best anonymous chat app to meet new people and make friends safely",
        "publisher": {
          "@id": "https://bondly.chat/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": "https://bondly.chat/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        ],
        "inLanguage": "en-US"
      },
      {
        "@type": "WebPage",
        "@id": "https://bondly.chat/#webpage",
        "url": "https://bondly.chat",
        "name": "Bondly - Anonymous Chat App | Chat with Strangers & Make Friends",
        "description": "Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections, and discover amazing conversations.",
        "isPartOf": {
          "@id": "https://bondly.chat/#website"
        },
        "about": {
          "@id": "https://bondly.chat/#webapp"
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "inLanguage": "en-US"
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData, null, 2) }}
    />
  );
}
