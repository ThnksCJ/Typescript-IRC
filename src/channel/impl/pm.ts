import {IChannel} from "../channel";
import {IClient} from "../../network/client";
import {IServer} from "../../network/server";

export class PMChannel implements IChannel {
    clients: IClient[];
    id: string;
    name: string;
    server: IServer;

    addClient(client: IClient): void {

    }

    broadcast(message: string): void {
    }

    removeClient(client: IClient): void {
    }
}