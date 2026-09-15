import { createServerFn } from "@tanstack/react-start";
import { getSql, type Sql } from "@/lib/db";
import { escrowBalance, spendTwoOfTwo, twoOfTwoAddress } from "@/lib/bch";

export type Escrow = {
  id: number;
  listingId: number;
  amountBch: string;
  payerPub: string | null;
  payeePub: string | null;
  address: string | null;
  status: string;
};

function mapEscrow(r: {
  id: number;
  listing_id: number;
  amount_bch: string;
  payer_pub: string | null;
  payee_pub: string | null;
  address: string | null;
  status: string;
}): Escrow {
  return {
    id: r.id,
    listingId: r.listing_id,
    amountBch: r.amount_bch,
    payerPub: r.payer_pub,
    payeePub: r.payee_pub,
    address: r.address,
    status: r.status,
  };
}

let escrowReady = false;

async function ensureEscrow(sql: Sql) {
  if (escrowReady) return;
  await sql.query(`
    create table if not exists bch_escrows (
      id serial primary key,
      listing_id int not null,
      amount_bch text not null,
      payer_pub text,
      payee_pub text,
      desk_pub text not null default '',
      address text,
      status text not null default 'waiting_keys',
      created_at timestamptz not null default now()
    )
  `);
  escrowReady = true;
}

export const getDeskPubkey = createServerFn({ method: "GET" }).handler(async () => null);

export const setDeskPubkey = createServerFn({ method: "POST" })
  .validator((input: { pubkey: string }) => input)
  .handler(async () => {
    throw new Error("Venice does not hold or publish a signing key.");
  });

export const getEscrow = createServerFn({ method: "GET" })
  .validator((input: { id: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    const rows = await sql<{
      id: number;
      listing_id: number;
      amount_bch: string;
      payer_pub: string | null;
      payee_pub: string | null;
      desk_pub: string;
      address: string | null;
      status: string;
    }>`select * from bch_escrows where id = ${data.id}`;
    return rows[0] ? mapEscrow(rows[0]) : null;
  });

export const escrowForListing = createServerFn({ method: "GET" })
  .validator((input: { listingId: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    const rows = await sql<{
      id: number;
      listing_id: number;
      amount_bch: string;
      payer_pub: string | null;
      payee_pub: string | null;
      desk_pub: string;
      address: string | null;
      status: string;
    }>`
      select * from bch_escrows
      where listing_id = ${data.listingId}
      order by created_at desc
      limit 1
    `;
    return rows[0] ? mapEscrow(rows[0]) : null;
  });

export const openEscrow = createServerFn({ method: "POST" })
  .validator((input: { listingId: number }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    const listing = await sql<{ amount: string; price: string; status: string }>`
      select amount, price, status from listings where id = ${data.listingId}
    `;
    const row = listing[0];
    if (!row || row.status !== "open") throw new Error("Ticket is gone.");
    const amountBch = (Number(row.amount) * Number(row.price)).toFixed(8);
    if (!Number.isFinite(Number(amountBch)) || Number(amountBch) <= 0) {
      throw new Error("BCH notional looks wrong.");
    }
    const existing = await sql<{ id: number }>`
      select id from bch_escrows
      where listing_id = ${data.listingId}
        and status in ('waiting_keys','waiting_fund','funded')
    `;
    if (existing[0]) return { id: existing[0].id };
    const created = await sql<{ id: number }>`
      insert into bch_escrows (listing_id, amount_bch, desk_pub, status)
      values (${data.listingId}, ${amountBch}, '', 'waiting_keys')
      returning id
    `;
    return { id: created[0].id };
  });

export const addEscrowKey = createServerFn({ method: "POST" })
  .validator((input: { id: number; role: "payer" | "payee"; pubkey: string }) => {
    const pubkey = input.pubkey.trim();
    if (!/^[0-9a-fA-F]{66}$/.test(pubkey)) throw new Error("Public key looks wrong.");
    if (input.role !== "payer" && input.role !== "payee") throw new Error("Pick payer or payee.");
    return { id: input.id, role: input.role, pubkey };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    const rows = await sql<{
      id: number;
      payer_pub: string | null;
      payee_pub: string | null;
      desk_pub: string;
      status: string;
    }>`select id, payer_pub, payee_pub, desk_pub, status from bch_escrows where id = ${data.id}`;
    const row = rows[0];
    if (!row) throw new Error("Escrow not found.");
    if (row.status !== "waiting_keys" && row.status !== "waiting_fund") {
      throw new Error("This escrow is finished.");
    }
    const payer = data.role === "payer" ? data.pubkey : row.payer_pub;
    const payee = data.role === "payee" ? data.pubkey : row.payee_pub;
    let address: string | null = null;
    let status = "waiting_keys";
    if (payer && payee) {
      address = twoOfTwoAddress([payer, payee]);
      status = "waiting_fund";
    }
    await sql`
      update bch_escrows
      set payer_pub = ${payer},
          payee_pub = ${payee},
          address = ${address},
          status = ${status}
      where id = ${data.id}
    `;
    return { address, status };
  });

export const markEscrow = createServerFn({ method: "POST" })
  .validator((input: { id: number; status: "funded" | "released" | "refunded" }) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    await sql`
      update bch_escrows set status = ${data.status}
      where id = ${data.id} and status in ('waiting_fund','funded')
    `;
    return { ok: true };
  });

export const getEscrowBalance = createServerFn({ method: "GET" })
  .validator((input: { address: string }) => input)
  .handler(async ({ data }) => escrowBalance(data.address));

export const spendEscrow = createServerFn({ method: "POST" })
  .validator((input: {
    id: number;
    dest: string;
    wif1: string;
    wif2: string;
    kind: "released" | "refunded";
  }) => {
    const dest = input.dest.trim();
    if (dest.length < 20) throw new Error("Destination looks wrong.");
    return { ...input, dest };
  })
  .handler(async ({ data }) => {
    const sql = await getSql();
    await ensureEscrow(sql);
    const rows = await sql<{
      address: string | null;
      payer_pub: string | null;
      payee_pub: string | null;
      desk_pub: string;
      status: string;
    }>`
      select address, payer_pub, payee_pub, desk_pub, status from bch_escrows where id = ${data.id}
    `;
    const row = rows[0];
    if (!row?.address || !row.payer_pub || !row.payee_pub) throw new Error("Escrow is not ready.");
    const result = await spendTwoOfTwo({
      address: row.address,
      pubs: [row.payer_pub, row.payee_pub],
      wifs: [data.wif1, data.wif2],
      dest: data.dest,
    });
    await sql`
      update bch_escrows set status = ${data.kind}
      where id = ${data.id}
    `;
    return result;
  });
