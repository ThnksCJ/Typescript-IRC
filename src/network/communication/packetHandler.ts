import {Client} from "../client";
import {Server} from "../server";
import {Packet, PacketBuilder} from "./packet";
import {opcodes} from "./opcodes";
import {logger} from "../../global";

/**
 * Handles packets between the server <-> client connection
 *
 * @class PacketHandler
 * @constructor
 * @param {Server} server The server instance
 * @param {Client} client The client instance (optional)
 */
export class PacketHandler {
    private readonly _client: Client;
    private readonly _server: Server;

    /**
     * @param {Server} server The server that the client is connected to | The server instance
     * @param {Client} client This client sending the packet (optional)
     */
    constructor(server: Server, client?: Client) {
        this._server = server;

        if (client) {
            this._client = client;
        }
    }

    /**
     * @param {Packet} packet The packet to send (An object with an opcode and data)
     *
     * @param jsonified Whether or not the packet should be stringified before sending
     * @returns {Promise<void>}
     */
    public async write(packet: Packet, jsonified: boolean = false) {
        await this._client.write(jsonified ? JSON.stringify(packet) : packet);
    }

    /**
     * @param {Client} client The client to send the packet to
     * @param {Packet} packet The packet to send (An object with an opcode and data)
     * @param jsonified Whether or not the packet should be stringified before sending
     *
     * @returns {Promise<void>}
     */
    public async writeToClient(client: Client, packet: Packet, jsonified: boolean = false) {
        await client.write(jsonified ? JSON.stringify(packet) : packet);
    }

    /**
     * Handles a packet from the client
     *
     * @param {string} jsonPacket The packet to handle (JSON stringified)
     * @param client The client that sent the packet
     *
     * @returns {Promise<void>}
     */
    public async handle(jsonPacket: string, client: Client) {
        try {
            let packet = await this.validatePacket(new PacketBuilder().fromJSON(jsonPacket).build());

            if (!packet)
                return;

            switch (packet.opcode) {
                case opcodes.ACCOUNT_INFO:
                    if (!(await this.validatePacketData(packet, ["username", "email"])))
                        return;

                    const {username, email} = packet.data as { username: string, email: string };

                    client.username = username;

                    logger.network.info(`Client (${client.username}) has identified themselves as ${username} (${email})`);
                    await this._server.broadcast(`${username} has joined the server!`);
            }

            if (client.username === "*")
                return await client.write(new PacketBuilder().setOpcode(opcodes.MESSAGE_RECEIVE).setData({
                    type: "error",
                    message: "You must identify yourself before proceeding into other parts of the IRC!"
                }).build());

            switch (packet.opcode) {
                case opcodes.PING:
                    break;
                case opcodes.PONG:
                    break;
            }
        } catch (e) {
            console.log(e)
            return;
        }
    }

    /**
     * Validates a packet to make sure it has the required base data
     *
     * @param packet The packet to validate
     */
    private async validatePacket(packet: Packet) {
        if (!packet.opcode || !packet.data) {
            return null;
        }

        for (let opcode in opcodes) {
            if (opcodes[opcode] === packet.opcode) {
                return packet;
            }
        }

        return null;
    }

    /**
     * Validates the packet data to make sure it has the required data to be processed
     *
     * @param packet The packet to validate
     * @param dataToValidate An array of strings that are the keys of the data to validate
     */
    private async validatePacketData(packet: Packet, dataToValidate: string[]) {
        for (let i = 0; i < dataToValidate.length; i++) {
            if (!packet.data[dataToValidate[i]]) {
                return false;
            }
        }

        return true;
    }
}