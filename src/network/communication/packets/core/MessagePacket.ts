import {opcodes} from "../../opcodes";
import {Packet} from "../../packet";
import {TextMessage} from "../../../../message/message";

class MessageData {
    message: TextMessage;
}

export class MessagePacket extends Packet {
    constructor(data: MessageData) {
        super(opcodes.MESSAGE_SEND, data);
    }
}