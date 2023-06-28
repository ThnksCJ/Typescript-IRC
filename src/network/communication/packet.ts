/**
 * A packet is a message sent from one client to another.
 * It contains an opcode and data.
 * The opcode is used to identify the type of packet.
 * The data is used to store the content of the packet.
 *
 * @constructor
 * @param opcode Operation code of the packet (@see {@link opcodes} for a list of opcodes)
 * @param data JSON data of the packet
 */
export class Packet {
    public readonly opcode: number;
    public readonly data: object;

    constructor(opcode: number, data: object) {
        this.opcode = opcode;
        this.data = data;
    }

    get raw(): string {
        return JSON.stringify(this);
    }
}

/**
 * A builder class for creating packets.
 *
 * @example
 * const packet = new PacketBuilder()
 * .setOpcode(opcodes.INTRODUCE)
 * .setData({ foo: 'bar' })
 * .build();
 */
export class PacketBuilder {
    private opcode: number;
    private data: object;

    /**
     * Sets the opcode of the packet
     *
     * @param opcode Operation code of the packet (see {@link opcodes} for a list of opcodes)
     */
    setOpcode(opcode: number): PacketBuilder {
        this.opcode = opcode;
        return this;
    }

    /**
     * Sets the data of the packet
     *
     * @param data JSON data of the packet
     */
    setData(data: PacketData): PacketBuilder {
        this.data = data;
        return this;
    }

    /**
     * Sets the data of the packet from a JSON string
     *
     * @param json JSON string of the packet data (must be parsable)
     */
    fromJSON(json: string): PacketBuilder {
        try {
            const packet = JSON.parse(json);
            this.opcode = packet.opcode;
            this.data = packet.data;
            return this;
        } catch (e) {
            return this;
        }
    }

    /**
     * Builds the packet
     *
     * @returns The built packet
     */
    public build(): Packet {
        return new Packet(this.opcode, this.data);
    }
}

type PacketData = {
    [key: string]: any;
};
