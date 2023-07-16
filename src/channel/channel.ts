import {IClient} from "../network/client";
import {IServer} from "../network/server";
import {Packet} from "../network/communication/packet";

export interface IChannel {
    clients: IClient[];
    server: IServer;
    name: string;
    id: string;

    sendPacket?(sendingClient: IClient, packet: Packet): void | Promise<void>;

    sendPacketTo?(sendingClient: IClient, receivingClient: IClient, packet: Packet): void | Promise<void>;

    addClient?(client: IClient): void | Promise<void>;

    removeClient?(client: IClient): void | Promise<void>;

    broadcast?(message: string): void | Promise<void>;
}