// DodoPayments product IDs — replace with your actual IDs from dashboard
export const PRODUCTS = {
  // Arhan Ahmad brand
  PORTFOLIO_AD_LEFT: {
    id: 'prod_xxx', // Replace with actual product ID
    name: 'Left Sidebar Ad — arhanahmad.com',
    price: 1,
    brand: 'arhan-ahmad',
  },
  PORTFOLIO_AD_RIGHT: {
    id: 'prod_xxx',
    name: 'Right Sidebar Ad — arhanahmad.com',
    price: 1,
    brand: 'arhan-ahmad',
  },
  OUTBID_BACKLINK: {
    id: 'prod_xxx',
    name: 'OutbidCopy Backlink',
    price: 1,
    brand: 'arhan-ahmad',
  },
  // ToolboxImage brand
  TOOLBOXIMAGE_PRO: {
    id: 'prod_xxx',
    name: 'ToolboxImage Pro',
    price: 9.99,
    brand: 'toolboximage',
  },
  // Subtitly brand
  SUBTITLY_PRO: {
    id: 'prod_xxx',
    name: 'Subtitly Pro',
    price: 4.99,
    brand: 'subtitly',
  },
} as const;

export type ProductKey = keyof typeof PRODUCTS;
