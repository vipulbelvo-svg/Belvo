export type ServicePillar =
  | "Growth & Performance"
  | "Creative Studio & Visuals"
  | "Brand Strategy & PR"
  | "Digital Products & Engineering";

export interface ServiceItem {
  id: string;
  category: string;
  title: string;
  pillar: ServicePillar;
  image: string;
  keywords: string[];
  desc: string;
  deliverables: string[];
}

export interface ServicePackage {
  id: string;
  name: string;
  tagline: string;
  pillar: ServicePillar;
  badge?: string;
  summary: string;
  deliverables: string[];
  bestFor: string;
  timeline: string;
}

export const SERVICE_PILLARS: {
  id: ServicePillar;
  name: string;
  tagline: string;
  iconName: string;
}[] = [
  {
    id: "Growth & Performance",
    name: "Growth & Performance",
    tagline: "Data-driven customer acquisition, conversion rate optimization, and retention engines.",
    iconName: "TrendingUp",
  },
  {
    id: "Creative Studio & Visuals",
    name: "Creative Studio & Visuals",
    tagline: "Commercial 3D/CGI, motion graphics, and direct-response UGC engineered to stop the scroll.",
    iconName: "Sparkles",
  },
  {
    id: "Brand Strategy & PR",
    name: "Brand Strategy & PR",
    tagline: "Strategic positioning, influencer networks, and public relations that command authority.",
    iconName: "Globe",
  },
  {
    id: "Digital Products & Engineering",
    name: "Digital Products & Engineering",
    tagline: "High-performance web apps, mobile solutions, and scalable custom digital architecture.",
    iconName: "Code",
  },
];

const serviceDefinitions: Omit<ServiceItem, "title">[] = [
  // ── Growth & Performance ──
  {
    id: "performance-marketing",
    category: "Performance Marketing",
    pillar: "Growth & Performance",
    image: "/ServicesImages/performance.png",
    keywords: ["paid ads", "Google Ads", "Meta Ads", "ROI", "ROAS", "PPC", "conversion campaigns"],
    desc: "We run data-driven paid media campaigns across Meta, Google, YouTube, and LinkedIn. Every rupee deployed is engineered for maximum ROAS through relentless creative testing and funnel optimization.",
    deliverables: [
      "Meta & Google Ads Full Campaign Architecture",
      "ROAS & CAC Optimization with Daily Monitoring",
      "Multi-Touch Attribution & Funnel Analytics",
      "Rapid Creative Iteration & Hook Testing",
    ],
  },
  {
    id: "seo-digital-marketing",
    category: "SEO & Organic Growth",
    pillar: "Growth & Performance",
    image: "/ServicesImages/seo.png",
    keywords: ["SEO", "organic growth", "search ranking", "keyword strategy", "on-page/off-page"],
    desc: "We optimize your digital infrastructure to dominate organic search. From technical audits to high-authority digital PR, we build search engines' favorite destinations that deliver compounding organic customer acquisition.",
    deliverables: [
      "Full Technical SEO Audit & Core Web Vitals Tuning",
      "High-Intent Keyword Gap & Competitor Mapping",
      "High-Authority Digital PR & Backlink Curation",
      "Structured Schema Markup & On-Page Architecture",
    ],
  },
  {
    id: "ecommerce-management",
    category: "E-Commerce Management",
    pillar: "Growth & Performance",
    image: "/ServicesImages/e-comm.png",
    keywords: ["e-commerce", "Shopify", "WooCommerce", "product listings", "conversion rate", "store management"],
    desc: "End-to-end e-commerce acceleration — from conversion rate optimization (CRO) to catalog management and checkout funnel tuning on Shopify and WooCommerce.",
    deliverables: [
      "Shopify & E-Commerce Store Architecture",
      "AOV Enhancement & Cart Abandonment Sequences",
      "Conversion Rate Optimization (CRO) A/B Testing",
      "Marketplace Sync & Catalog Management",
    ],
  },
  {
    id: "crm-automation",
    category: "CRM & Lifecycle Automation",
    pillar: "Growth & Performance",
    image: "/ServicesImages/crm.png",
    keywords: ["CRM setup", "workflow automation", "Zapier", "HubSpot", "customer retention", "lead management"],
    desc: "We implement enterprise-grade CRM systems, automated WhatsApp funnels, and email marketing workflows that capture leaked revenue and maximize customer lifetime value (LTV).",
    deliverables: [
      "Klaviyo / HubSpot Lifecycle Automation Flows",
      "WhatsApp Business API Broadcasts & Triggers",
      "Lead Scoring & Sales Pipeline Integration",
      "Zapier / Make Multi-System Automation Hooks",
    ],
  },

  // ── Creative Studio & Visuals ──
  {
    id: "3d-cgi",
    category: "3D & CGI Visualization",
    pillar: "Creative Studio & Visuals",
    image: "/ServicesImages/3d.png",
    keywords: ["3D rendering", "CGI", "product visualization", "architectural renders", "3D animation"],
    desc: "We create photorealistic 3D visuals, cinematic product renders, and hyper-realistic CGI campaigns. Launch high-impact visual campaigns before physical production ever takes place.",
    deliverables: [
      "Photorealistic 3D Product Modeling & Texturing",
      "Commercial Studio Lighting & Angle Setup",
      "CGI Motion & Physics-Based Simulations",
      "Interactive 3D Web & AR Asset Preparation",
    ],
  },
  {
    id: "animation-vfx",
    category: "Animation & VFX",
    pillar: "Creative Studio & Visuals",
    image: "/ServicesImages/vfx.png",
    keywords: ["motion graphics", "visual effects", "2D/3D animation", "explainer videos"],
    desc: "From sleek kinetic typography and brand animation to full visual effects pipelines, we translate complex brand stories into spellbinding motion that commands immediate attention.",
    deliverables: [
      "2D & 3D Kinetic Motion Graphics",
      "Product Demo & Explainer Video Production",
      "Visual Effects (VFX) Compositing & Clean Plates",
      "Platform-Optimized Social Motion Variants",
    ],
  },
  {
    id: "ugc-content-creation",
    category: "UGC Content Creation",
    pillar: "Creative Studio & Visuals",
    image: "/ServicesImages/ugc.png",
    keywords: ["authentic content", "creator videos", "product storytelling", "social engagement"],
    desc: "We produce authentic, hook-focused user-generated content that looks and feels native to TikTok and Instagram Reels — proven to outperform polished studio ads in direct-response campaigns.",
    deliverables: [
      "Direct-Response Scriptwriting & Hook Strategy",
      "Curated Creator Casting & Production Briefs",
      "High-Production Mobile Filming & Dynamic Edits",
      "Multiple A/B Testing Variations (Hooks & CTAs)",
    ],
  },
  {
    id: "graphics-designing",
    category: "Graphic Design & Packaging",
    pillar: "Creative Studio & Visuals",
    image: "/ServicesImages/graphic.png",
    keywords: ["graphic design", "visual content", "marketing creatives", "UI graphics", "print"],
    desc: "Our design team produces stunning visual collateral across digital and physical touchpoints — including direct-response ad creatives, product packaging, and investor decks.",
    deliverables: [
      "High-Converting Ad Creatives & Static Banners",
      "Retail-Ready Product Packaging & Label Design",
      "Brand Collateral, Pitch Decks & Presentations",
      "Multi-Format Social Media Creative Suites",
    ],
  },

  // ── Brand Strategy & PR ──
  {
    id: "branding",
    category: "Brand Strategy & Identity",
    pillar: "Brand Strategy & PR",
    image: "/ServicesImages/brand.png",
    keywords: ["brand identity", "logo", "brand guide", "visual language", "positioning"],
    desc: "From brand positioning and core narrative to bespoke typography and visual guidelines, we build comprehensive brand identity systems crafted to outshine category incumbents.",
    deliverables: [
      "Brand Positioning, Archetype & Tone of Voice",
      "Custom Logo Suite & Typography Systems",
      "Comprehensive Brand Guidelines & Rules Book",
      "Category Competitive Intelligence Audit",
    ],
  },
  {
    id: "brand-outreach-pr",
    category: "Brand Outreach & PR",
    pillar: "Brand Strategy & PR",
    image: "/ServicesImages/pr.png",
    keywords: ["public relations", "brand awareness", "media coverage", "press", "outreach"],
    desc: "We place your brand at the center of industry conversation through strategic media relations, founder profiling, high-tier press features, and curated digital outreach.",
    deliverables: [
      "Press Release Drafting & Syndication to Top Publications",
      "Founder Profiling & Thought Leadership Pieces",
      "Product Seeding & Editorial Gift Guides",
      "Brand Authority & Reputation Management",
    ],
  },
  {
    id: "social-media",
    category: "Social Media Management",
    pillar: "Brand Strategy & PR",
    image: "/ServicesImages/social.png",
    keywords: ["content creation", "social strategy", "community management", "Instagram", "LinkedIn"],
    desc: "We transform social channels from broadcast feeds into thriving brand ecosystems. We combine viral storytelling with rigorous platform cadence to build passionate communities.",
    deliverables: [
      "Monthly Omnichannel Content Calendar & Themes",
      "Active Community Moderation & DM Funnel Routing",
      "Trend-Jacked Video Concepts & Formats",
      "Monthly Engagement, Reach & Growth Analytics",
    ],
  },
  {
    id: "influencer-marketing",
    category: "Influencer Marketing",
    pillar: "Brand Strategy & PR",
    image: "/ServicesImages/influencer.png",
    keywords: ["influencer outreach", "UGC", "creator campaigns", "brand collaborations", "micro-influencers"],
    desc: "We connect your brand with high-resonance creators — from nano-influencers with cult followings to celebrity ambassadors — managing everything from contracts to whitelisted ad scaling.",
    deliverables: [
      "Data-Backed Creator Identification & Vetting",
      "End-to-End Contract Negotiation & Rights Management",
      "Co-Created Content Briefs & Production Direction",
      "Whitelisted Paid Ad Amplification & Attribution",
    ],
  },

  // ── Digital Products & Engineering ──
  {
    id: "web-development",
    category: "Web Engineering & Platforms",
    pillar: "Digital Products & Engineering",
    image: "/ServicesImages/web-dev.png",
    keywords: ["website design", "frontend", "backend", "responsive", "CMS", "custom web apps"],
    desc: "We engineer lightning-fast, visually breathtaking websites and digital platforms using modern web stacks (React, Next.js, TypeScript). Engineered for peak conversion and 95+ Core Web Vitals.",
    deliverables: [
      "Bespoke High-Converting UI/UX Design Systems",
      "Full-Stack Development (React, Next.js, Node.js)",
      "Headless CMS & E-Commerce Integration",
      "Speed, Security & Core Web Vitals Optimization",
    ],
  },
  {
    id: "app-development",
    category: "Mobile App Development",
    pillar: "Digital Products & Engineering",
    image: "/ServicesImages/app.png",
    keywords: ["mobile app", "iOS", "Android", "Flutter", "React Native", "UI/UX", "app design"],
    desc: "We design and develop high-performance mobile applications for iOS and Android. From initial wireframes and interactive prototypes to App Store deployment and ongoing maintenance.",
    deliverables: [
      "iOS & Android Development (Flutter / React Native)",
      "Intuitive Mobile UX Architecture & Touch Interactivity",
      "RESTful & GraphQL API Integration",
      "App Store & Google Play Launch Management",
    ],
  },
  {
    id: "software-development",
    category: "Custom Software Solutions",
    pillar: "Digital Products & Engineering",
    image: "/ServicesImages/Software.png",
    keywords: ["custom software", "SaaS", "enterprise solutions", "API", "backend systems"],
    desc: "We build custom software, internal operational tools, and SaaS MVPs built with clean architecture, enterprise-level security, and the flexibility to scale alongside your business.",
    deliverables: [
      "Custom SaaS Platform Architecture & Prototyping",
      "Secure Cloud Backend & Database Infrastructure",
      "Custom Admin Portals & Workflow Dashboards",
      "API Integrations & Third-Party System Bridges",
    ],
  },
];

export const SERVICES: ServiceItem[] = serviceDefinitions.map((service) => ({
  ...service,
  title: service.category,
}));

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "growth-engine",
    name: "Full-Funnel Growth Retainer",
    tagline: "The comprehensive acquisition engine for scaling D2C and modern brands.",
    pillar: "Growth & Performance",
    badge: "Most Popular",
    summary:
      "A complete cross-functional growth team deploying high-budget paid media across Meta and Google, combined with continuous creative iteration and conversion rate optimization.",
    deliverables: [
      "Full Paid Ads Management (Meta, Google, YouTube)",
      "Bi-Weekly Creative Refresh (UGC + Motion Graphics)",
      "Conversion Rate Optimization (CRO) & Funnel Audits",
      "Dedicated Slack Channel & Weekly Growth Reviews",
    ],
    bestFor: "Brands scaling past ₹10L+/mo ad spend wanting predictable customer acquisition.",
    timeline: "Quarterly or Annual Retainer",
  },
  {
    id: "brand-launchpad",
    name: "Brand Identity Launchpad",
    tagline: "Turn an ambitious concept into an unforgettable market leader.",
    pillar: "Brand Strategy & PR",
    summary:
      "From zero to complete category authority. We craft your core positioning, logo suites, design guidelines, and launch-ready digital touchpoints.",
    deliverables: [
      "Strategic Market Positioning & Archetype Definition",
      "Complete Brand Identity, Logo Suite & Typography",
      "Packaging / Digital Collateral Design Guidelines",
      "Social Media Launch Kit & Visual Stylebook",
    ],
    bestFor: "New venture launches, seed-stage startups, and legacy brands seeking a complete modern rebrand.",
    timeline: "4–6 Weeks Sprint",
  },
  {
    id: "creative-studio-sprint",
    name: "Creative Studio Production Sprint",
    tagline: "A high-velocity pipeline of scroll-stopping creative assets.",
    pillar: "Creative Studio & Visuals",
    summary:
      "A dedicated creative sprint delivering high-production 3D product visualizations, cinematic motion graphics, and direct-response UGC reels engineered for high CTR.",
    deliverables: [
      "Photorealistic 3D Renders for Product Catalog",
      "10–15 Direct-Response UGC Video Variations",
      "3D Motion Graphics Commercials & Product Reveal",
      "A/B Testing Variants with Multi-Hook Formats",
    ],
    bestFor: "E-commerce and consumer brands needing high-volume creative assets for ads and social channels.",
    timeline: "2–4 Weeks Delivery",
  },
  {
    id: "digital-engineering",
    name: "Digital Products & Custom Engineering",
    tagline: "High-performance web applications and custom software platforms.",
    pillar: "Digital Products & Engineering",
    summary:
      "Bespoke web applications, headless Shopify platforms, and custom digital software built for lightning speed, unmatched aesthetics, and high conversion.",
    deliverables: [
      "Custom Modern Web Application (Next.js / React)",
      "Headless E-Commerce Architecture (Shopify Storefront API)",
      "Core Web Vitals 95+ Guarantee & Technical SEO Setup",
      "Post-Launch Warranty, DevOps & Continuous Support",
    ],
    bestFor: "Brands requiring bespoke digital experiences beyond generic templates.",
    timeline: "4–8 Weeks Scope",
  },
];
