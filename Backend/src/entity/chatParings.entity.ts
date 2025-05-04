import { Column, JoinColumn, ManyToOne } from "typeorm";
import { GlobalEntity } from "./global.entity";
import { SessionDetails } from "./sessionDetails.entity";

export class ChatPairing extends GlobalEntity{
    constructor()
    {
        super()
    }

    @ManyToOne(() => SessionDetails, (details) => details.id)
    @JoinColumn()
    sessionId1: string;

    @ManyToOne(() => SessionDetails, (details) => details.id)
    @JoinColumn()
    sessionId2: string;

    @Column({ type: "timestamp" })
    sessionEndedOn: Date;
}