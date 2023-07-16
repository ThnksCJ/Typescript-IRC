import {IChannel} from "../channel";
import {IClient} from "../../network/client";
import {IServer} from "../../network/server";
import {Packet, PacketBuilder} from "../../network/communication/packet";
import {opcodes} from "../../network/communication/opcodes";

export class RoomChannel implements IChannel {
    clients: IClient[];
    id: string;
    name: string;
    server: IServer;

    constructor(roomName: string, server: IServer) {
        this.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.name = roomName;
        this.server = server;
        this.clients = [];
    }

    async sendPacket(sendingClient: IClient, packet: Packet) {
        for (const client of this.clients) {
            if (client !== sendingClient) {
                await client.write(packet);
            }
        }
    }

    async addClient(client: IClient) {
        client.channel = this;
        this.clients.push(client);

        client.write(new PacketBuilder().setOpcode(opcodes.CHANNEL_MEMBER_LIST).setData(this.clients.map(client => client.identifier)).build());
        await client.introduce(this)
    }

    removeClient(client: IClient) {
        this.clients.splice(this.clients.indexOf(client), 1);
    }

    async broadcast(message: string) {
        for (const client of this.clients) {
            await client.write(new PacketBuilder().setOpcode(opcodes.MESSAGE_RECEIVE).setData({
                message: message
            }).build());
        }
    }
}