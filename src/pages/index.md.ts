// Serves the site as text/markdown when Accept: text/markdown is requested
// This is the acceptmarkdown.com protocol — agents get clean markdown, browsers get HTML
export async function GET() {
  const markdown = `# Arhan Ahmad — Builder & Indie Hacker

> Developer based in Lucknow, India. I build small web products — weird ideas, real revenue.

## About

Arhan Ahmad is an indie hacker and builder shipping 9 experimental web products under arhanahmad.com.
Target: $50 MRR. Stack: Astro + Tailwind CSS + Cloudflare Pages + DodoPayments.

## Products

- [NameAPlanet](https://arhanahmad.com/nameaplanet): Name a planet after someone you love ($2.99–$9.99)
- [BuyAMoon](https://arhanahmad.com/buyamoon): Claim a fictional moon crater ($4.99–$14.99)
- [StartupGraveyard](https://arhanahmad.com/startupgraveyard): Tombstones for dead startups (Free + $29 premium)
- [FlipAFate](https://arhanahmad.com/flipafate): Stop overthinking, let fate decide (Free + $1.99)
- [ChaosGarden](https://arhanahmad.com/chaosgarden): Track bad habits, celebrate failures (Free + $2.99)
- [TimeWasted](https://arhanahmad.com/timewasted): Calculate time wasted on the internet (Free)
- [LaunchPad](https://arhanahmad.com/launchpad): Pre-launch waitlist + discovery (Free / $9 / $29)
- [MakeAbsurd](https://arhanahmad.com/makeabsurd): AI landing pages for ridiculous products ($4.99)
- [WeirdPage](https://arhanahmad.com/weirdpage): Portfolio for weird builders ($9.99)

## Live Products

- [ToolboxImage](https://toolboximage.com): AI-powered image toolbox
- [Subtitly](https://subtitly.pages.dev): Auto-generate subtitles for any video

## Contact

- Email: email@arhanahmad.com
- X: https://x.com/ahmadarhankhan
- GitHub: https://github.com/arhan18

## Agent Resources

- llms.txt: https://arhanahmad.com/llms.txt
- Sitemap: https://arhanahmad.com/sitemap-index.xml
`;

  return new Response(markdown, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Vary': 'Accept, Accept-Encoding',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
