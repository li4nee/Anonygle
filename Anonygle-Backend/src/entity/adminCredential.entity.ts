import { Column } from "typeorm";
import { GlobalEntity } from "./global.entity";

export class AdminCredential extends GlobalEntity {
  constructor() {
    super();
  }

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
