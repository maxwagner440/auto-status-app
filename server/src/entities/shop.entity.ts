import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: "shops" })
export class ShopEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index({ unique: true })
  @Column({ type: "text", default: () => "gen_random_uuid()::text" })
  shopKey!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  phone!: string;

  @Column({ type: "text" })
  hours!: string;

  @Column({ type: "text", nullable: true })
  primaryContactName!: string | null;

  @Column({
    type: "text",
    default: () => "'$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'",
  })
  passwordHash!: string;

  @Column({ type: "boolean", default: false })
  requiresVerification!: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamptz" })
  deletedAt!: Date | null;
}
