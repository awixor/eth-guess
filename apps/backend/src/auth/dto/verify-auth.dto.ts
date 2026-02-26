export class VerifyAuthDto {
  /** Raw EIP-4361 SIWE message string */
  message: string;

  /** 0x-prefixed hex signature from the wallet */
  signature: string;
}
