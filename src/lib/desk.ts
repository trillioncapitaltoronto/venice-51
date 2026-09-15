import { createServerFn } from "@tanstack/react-start";

const handleRe = /^[A-Za-z0-9_@.\-+]{2,64}$/;

function cleanHandle(raw: string) {
  const h = raw.trim().replace(/^@/, "");
  if (!handleRe.test(h)) throw new Error("Discord name looks wrong.");
  return h;
}

export const listPosters = createServerFn({ method: "GET" }).handler(async () => {
  const { listImpl } = await import("./desk.server");
  return listImpl();
});

export const grantPoster = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; discord: string }) => ({
    deskKey: input.deskKey,
    discord: cleanHandle(input.discord),
  }))
  .handler(async ({ data }) => {
    const { grantImpl } = await import("./desk.server");
    return grantImpl(data.deskKey, data.discord);
  });

export const revokePoster = createServerFn({ method: "POST" })
  .validator((input: { deskKey: string; discord: string }) => ({
    deskKey: input.deskKey,
    discord: cleanHandle(input.discord),
  }))
  .handler(async ({ data }) => {
    const { revokeImpl } = await import("./desk.server");
    return revokeImpl(data.deskKey, data.discord);
  });
