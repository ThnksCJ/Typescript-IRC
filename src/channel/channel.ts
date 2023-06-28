import {IClient} from "../network/client";
import {IServer} from "../network/server";

export interface IChannel {
    clients: IClient[];
    server: IServer;
    name: string;
    id: string;

    addClient(client: IClient): void;

    removeClient(client: IClient): void;

    broadcast(message: string): void;
}