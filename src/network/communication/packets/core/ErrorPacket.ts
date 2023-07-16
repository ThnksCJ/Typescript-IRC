import {Packet} from "../../packet";
import {opcodes} from "../../opcodes";

class ErrorPacketData {
    type: "generic" | "channel" | "account";
    message: string;
}

export class ErrorPacket extends Packet {
    constructor(data: ErrorPacketData) {
        super(opcodes.ERROR, data);
    }
}