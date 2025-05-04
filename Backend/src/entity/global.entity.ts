import { generateId } from "src/utils/base.utiils";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Represents a global entity with common properties.
 *
 * @class GlobalEntity
 * @property {string} id - Unique identifier for the entity, generated with a function which is in base utils.
 * @property {Date} createdAt - Timestamp indicating when the entity was created.
 * @property {boolean} trash - Flag indicating whether the entity is marked as trash. Defaults to false.
 * @property {Date} [updatedAt] - Timestamp indicating when the entity was last updated. Nullable.
 */

@Entity()
export class GlobalEntity {
  constructor() {
    this.id = generateId();
  }
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @Column({ default: false })
  trash: boolean = false;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  updatedAt: Date;
}
