import * as secp from "@noble/secp256k1";
import { sha256 } from "@noble/hashes/sha2.js";
import { createBase58check } from "@scure/base";

const b58 = createBase58check(sha256);

export function newBchKey() {
  const { secretKey, publicKey } = secp.keygen();
  const wifBytes = new Uint8Array(1 + secretKey.length + 1);
  wifBytes[0] = 0x80;
  wifBytes.set(secretKey, 1);
  wifBytes[wifBytes.length - 1] = 0x01;
  return {
    wif: b58.encode(wifBytes),
    pubkey: bytesToHex(publicKey.length === 33 ? publicKey : secp.getPublicKey(secretKey, true)),
  };
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
