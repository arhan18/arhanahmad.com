import { createClient } from '@libsql/client';

const turso = createClient({
  url: import.meta.env.TURSO_DATABASE_URL || '',
  authToken: import.meta.env.TURSO_AUTH_TOKEN || '',
});

export default turso;

export interface Slot {
  position: number;
  website_url: string | null;
  brand_name: string | null;
  bid_amount: number;
  occupant_name: string | null;
  created_at: string;
}

export async function getSlots(): Promise<Slot[]> {
  const result = await turso.execute('SELECT * FROM slots ORDER BY position');
  return result.rows as unknown as Slot[];
}

export async function getSlot(position: number): Promise<Slot | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM slots WHERE position = ?',
    args: [position],
  });
  return (result.rows[0] as unknown as Slot) || null;
}

export async function updateSlot(
  position: number,
  websiteUrl: string,
  brandName: string,
  bidAmount: number,
  occupantName: string
) {
  await turso.execute({
    sql: `UPDATE slots SET website_url = ?, brand_name = ?, bid_amount = ?, occupant_name = ? WHERE position = ?`,
    args: [websiteUrl, brandName, bidAmount, occupantName, position],
  });
}

export async function getNextBidAmount(position: number): Promise<number> {
  const slot = await getSlot(position);
  if (!slot) return 1;
  if (!slot.occupant_name) return 1;
  return slot.bid_amount + 1;
}
