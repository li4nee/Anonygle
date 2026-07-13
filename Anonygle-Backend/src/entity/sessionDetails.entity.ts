import { Column, Entity } from "typeorm";
import { GlobalEntity } from "./global.entity";

@Entity()
export class SessionDetails extends GlobalEntity {
  constructor() {
    super();
  }

  @Column()
  ip: string;

  @Column()
  userAgent: string;
}
