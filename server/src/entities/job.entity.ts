import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ShopEntity } from "./shop.entity";

@Entity({ name: "jobs" })
export class JobEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text" })
  token!: string;

  @Column({ type: "text" })
  customerContact!: string;

  @Column({ type: "text", nullable: true })
  customerPhoneLast4!: string | null;

  @Column({ type: "text" })
  vehicleLabel!: string;

  @Column({ type: "text" })
  stateKey!: string;

  @Column({ type: "text" })
  flagKey!: string;

  @Column({ type: "boolean", default: true })
  active!: boolean;

  @Column({ type: "uuid" })
  shopId!: string;

  @ManyToOne(() => ShopEntity)
  @JoinColumn({ name: "shopId" })
  shop!: ShopEntity;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;
}
