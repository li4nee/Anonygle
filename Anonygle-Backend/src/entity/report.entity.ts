import { Column, ManyToOne } from "typeorm";
import { GlobalEntity } from "./global.entity";
import { SessionDetails } from "./sessionDetails.entity";
import { ChatPairing } from "./chatParings.entity";
import { REPORT_STATUS, TYPE_OF_REPORT } from "src/types/base.type";

export class ModerationReport extends GlobalEntity {
    constructor() {
        super();
    }

    @ManyToOne(()=>SessionDetails, (details) => details.id)
    reportedBy: string;

    @ManyToOne(()=>SessionDetails, (details) => details.id)
    reportedAgainst: string;

    @ManyToOne(()=>ChatPairing, (pairing) => pairing.id)
    chatPairing: string;

    @Column({ type: "text" })
    reason: string;

    @Column({type:"enum",enum:REPORT_STATUS,default:REPORT_STATUS.PENDING})
    status: REPORT_STATUS;

    @Column({type:"enum",enum:TYPE_OF_REPORT,nullable:false})
    type: TYPE_OF_REPORT;
    
}