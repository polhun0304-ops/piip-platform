/**
 * E2E public key registry for E2EE PoC
 * Stores a user's public key (exported raw/base64) for other clients to fetch.
 */
export declare class E2EKey {
    id: string;
    userId: string;
    publicKey: string;
    createdAt: Date;
}
export default E2EKey;
