import { Column, Entity } from "typeorm";
import { GlobalEntity } from "./global.entity";

@Entity()
export class AdminCredential extends GlobalEntity {
  constructor() {
    super();
  }

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
