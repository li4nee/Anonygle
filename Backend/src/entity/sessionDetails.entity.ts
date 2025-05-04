import { Column } from "typeorm";
import { GlobalEntity } from "./global.entity";

export class SessionDetails extends GlobalEntity {
    constructor() {
        super();
    }

    @Column()
    ip: string;

    @Column()
    userAgent: string;
}