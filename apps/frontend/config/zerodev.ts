export const ZERODEV_PROJECT_ID =
  process.env.NEXT_PUBLIC_ZERODEV_PROJECT_ID ?? "";

export const ZERODEV_CHAIN_SLUG =
  process.env.NEXT_PUBLIC_ZERODEV_CHAIN_SLUG ?? "sepolia";

export const BUNDLER_URL = ZERODEV_PROJECT_ID
  ? `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${ZERODEV_CHAIN_SLUG}`
  : "";

export const PAYMASTER_URL = ZERODEV_PROJECT_ID
  ? `https://rpc.zerodev.app/api/v3/${ZERODEV_PROJECT_ID}/chain/${ZERODEV_CHAIN_SLUG}`
  : "";

export const SESSION_KEY_STORAGE_KEY = "ethguess:session_key";
