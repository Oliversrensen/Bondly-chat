import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/og-image.png',
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | Bondly - Anonymous Chat` : 'Bondly - Anonymous Chat App | Chat with Strangers & Make Friends';
  const fullDescription = description || 'Join Bondly, the best anonymous chat app to meet new people and make friends. Chat with strangers safely, build meaningful connections, and discover amazing conversations.';

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`https://bondly.chat${canonical}`} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={`https://bondly.chat${ogImage}`} />
      <meta property="og:url" content={`https://bondly.chat${canonical || ''}`} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Bondly - Anonymous Chat" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={`https://bondly.chat${ogImage}`} />
      <meta name="twitter:site" content="@bondly_chat" />
      <meta name="twitter:creator" content="@bondly_chat" />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Additional SEO */}
      <meta name="author" content="Bondly Team" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#FF6B00" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Bondly" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content="en-US" />
      <meta name="language" content="English" />
      
      {/* Geo tags (if needed for specific regions) */}
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
    </Head>
  );
}
