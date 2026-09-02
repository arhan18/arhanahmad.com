import type { PagesFunction } from '@cloudflare/workers-types';

const markdownPages: Record<string, string> = {
  '/about/': `# About Arhan Ahmad

Arhan Ahmad is a builder and indie hacker based in Lucknow, India. He creates small, weird, and profitable web products.

## What I Do

- Build web products using Astro, Tailwind CSS, and Cloudflare
- Share the journey on X (Twitter) as @ahmadarhankhan
- Write about building in public and indie hacking
- Create tools that are useful, weird, or both

## My Stack

- **Frontend:** Astro 7, Tailwind CSS 4, JavaScript, TypeScript
- **Backend:** Cloudflare Pages, Workers, D1, R2
- **Payments:** DodoPayments (Merchant of Record, India-friendly)
- **Database:** Turso (SQLite at the edge)
- **Email:** Resend
- **AI:** Building AI-powered tools and exploring agents

## Products

- **ToolboxImage** — AI-powered image toolbox (resize, compress, convert)
- **Subtitly** — Auto-generate subtitles for any video
- **Sufi Khanqah** — The living library of Sufism (search sources, trace lineages, knowledge graphs)
- **NameAPlanet** — Name a planet after someone you love
- **BuyAMoon** — Claim a fictional moon crater
- **StartupGraveyard** — Tombstones for dead startups
- **FlipAFate** — Let fate decide your decisions
- **ChaosGarden** — Track bad habits, celebrate failures
- **TimeWasted** — Calculate time wasted online
- **LaunchPad** — Pre-launch waitlist pages
- **MakeAbsurd** — AI landing pages for ridiculous products
- **WeirdPage** — Portfolio for weird builders
- **OutbidCopy** — Get backlinks by outbidding competitors

## Contact

- **Email:** email@arhanahmad.com
- **X:** [@ahmadarhankhan](https://x.com/ahmadarhankhan)
- **GitHub:** [arhan18](https://github.com/arhan18)
- **LinkedIn:** [arhan-ahmad-khan](https://www.linkedin.com/in/arhan-ahmad-khan-539557312/)
- **Fiverr:** [arhanahmad979](https://www.fiverr.com/s/p3pg1vY)

## Building in Public

I document my journey on X and in my newsletter. Every product, every failure, every lesson — shared openly.

Currently targeting $50 MRR in 4-6 weeks through a portfolio of small web products.
`,
  '/contact/': `# Contact Arhan Ahmad

## Email

The best way to reach me is via email: **email@arhanahmad.com**

I typically respond within 24-48 hours.

## Social

- **X (Twitter):** [@ahmadarhankhan](https://x.com/ahmadarhankhan) — DMs open
- **GitHub:** [arhan18](https://github.com/arhan18) — Issues and PRs welcome
- **LinkedIn:** [arhan-ahmad-khan](https://www.linkedin.com/in/arhan-ahmad-khan-539557312/)

## Fiverr

For professional services, visit my Fiverr profile: [arhanahmad979](https://www.fiverr.com/s/p3pg1vY)

## Location

Based in Lucknow, India (IST timezone, UTC+5:30).

## Response Times

- **Email:** 24-48 hours
- **X DMs:** Usually within a few hours during business hours
- **GitHub Issues:** 1-3 days
`,
  '/privacy/': `# Privacy Policy

**Last updated:** September 2, 2026

## Overview

Arhan Ahmad ("I", "me", "my") operates arhanahmad.com. This privacy policy explains how I collect, use, and protect your information.

## Information I Collect

### Newsletter Subscription
- **Email address:** Collected when you subscribe to the newsletter
- **Name:** Optional, if you provide it
- **Purpose:** To send you updates about new products and content

### Product Purchases
- **Email address:** Collected during checkout via DodoPayments
- **Payment information:** Processed by DodoPayments (I don't store credit card details)
- **Purpose:** To deliver purchased products and provide support

### Website Usage
- **Analytics:** Basic page views and traffic patterns (via Cloudflare Analytics)
- **Purpose:** To improve the website and understand what content is valuable

## How I Use Your Information

- **Newsletter:** To send occasional updates (no more than once per week)
- **Products:** To deliver digital products and provide customer support
- **Website:** To improve content and user experience

## Data Sharing

I do not sell, trade, or rent your personal information to third parties.

### Service Providers
I use the following services that may process your data:
- **Cloudflare:** Website hosting and analytics
- **DodoPayments:** Payment processing (Merchant of Record)
- **Resend:** Email delivery
- **Turso:** Database storage

## Data Security

I implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.

## Your Rights

You have the right to:
- **Access:** Request a copy of the data I hold about you
- **Correction:** Request correction of inaccurate data
- **Deletion:** Request deletion of your data
- **Unsubscribe:** Unsubscribe from newsletters at any time

## Contact

For privacy-related inquiries, contact me at: **email@arhanahmad.com**
`,
};

const notFoundMarkdown = `# 404 — Page Not Found

This path does not exist on arhanahmad.com.

## Where to go next

- [/](https://arhanahmad.com) — Homepage (Arhan Ahmad, Builder & Indie Hacker)
- [/llms.txt](https://arhanahmad.com/llms.txt) — Site description for AI agents
- [/sitemap-index.xml](https://arhanahmad.com/sitemap-index.xml) — Full site map (all indexed URLs)
- [/about](https://arhanahmad.com/about) — About Arhan Ahmad
- [/products](https://arhanahmad.com/products) — All products

## Products

- [NameAPlanet](https://arhanahmad.com/nameaplanet) — Name a planet after someone you love
- [BuyAMoon](https://arhanahmad.com/buymoon) — Claim a fictional moon crater
- [StartupGraveyard](https://arhanahmad.com/startupgraveyard) — Tombstones for dead startups
- [FlipAFate](https://arhanahmad.com/flipafate) — Let fate decide
- [ChaosGarden](https://arhanahmad.com/chaosgarden) — Track bad habits
- [TimeWasted](https://arhanahmad.com/timewasted) — Calculate time wasted online
- [LaunchPad](https://arhanahmad.com/launchpad) — Pre-launch waitlist & discovery
- [MakeAbsurd](https://arhanahmad.com/makeabsurd) — AI landing pages for ridiculous products
- [WeirdPage](https://arhanahmad.com/weirdpage) — Portfolio for weird builders

## Contact

- Email: email@arhanahmad.com
- X: [@ahmadarhankhan](https://x.com/ahmadarhankhan)
- GitHub: [arhan18](https://github.com/arhan18)
`;

export const onRequest: PagesFunction = async (context) => {
  const { request, next } = context;
  
  const response = await next();
  const accept = request.headers.get('accept') || '';
  const url = new URL(request.url);
  const path = url.pathname;
  
  if (accept.includes('text/markdown')) {
    if (response.status === 404) {
      return new Response(notFoundMarkdown, {
        status: 404,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding',
        },
      });
    }
    
    if (markdownPages[path]) {
      return new Response(markdownPages[path], {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Vary': 'Accept, Accept-Encoding',
        },
      });
    }
  }
  
  return response;
};
