import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

/**
 * E2E public key registry for E2EE PoC
 * Stores a user's public key (exported raw/base64) for other clients to fetch.
 */
@Entity()
export class E2EKey {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "text" })
  publicKey!: string; // base64 or raw

  @CreateDateColumn()
  createdAt!: Date;
}

export default E2EKey;
