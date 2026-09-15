import { createServerFn } from "@tanstack/react-start";

export type Print = {
  listingId: number;
  code: string;
  coin: string;
  amount: string;
  price: string;
  poster: string;
  other: string;
  posterWallet: string;
  otherWallet: string;
  posterSaid: boolean;
  otherSaid: boolean;
  printedAt: string | null;
  status: "pending" | "printed";
};

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

function cleanHandle(raw: string) {
  const h = raw.trim().replace(/^@/, "");
  if (!handleRe.test(h)) throw new Error("Discord name looks wrong.");
  return h;
}

export const listTape = createServerFn({ method: "GET" }).handler(async () => {
  const { listTapeImpl } = await import("./prints.server");
  return listTapeImpl();
});

export const getPrint = createServerFn({ method: "GET" })
  .validator((input: { listingId: number }) => input)
  .handler(async ({ data }) => {
    const { getPrintImpl } = await import("./prints.server");
    return getPrintImpl(data.listingId);
  });

export const stampPrint = createServerFn({ method: "POST" })
  .validator((input: { listingId: number; discord: string; counterparty: string }) => ({
    listingId: input.listingId,
    discord: cleanHandle(input.discord),
    counterparty: cleanHandle(input.counterparty),
  }))
  .handler(async ({ data }) => {
    const { stampPrintImpl } = await import("./prints.server");
    return stampPrintImpl(data);
  });
