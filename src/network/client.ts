import {Transceiver} from "./transceiver";
import {Socket} from "net";
import {IServer, Server} from "./server";
import {Observable} from 'rxjs';
import {TextMessage} from "../message/message";
import {PacketHandler} from "./communication/packetHandler";
import {Packet, PacketBuilder} from "./communication/packet";
import {opcodes} from "./communication/opcodes";
import {IChannel} from "../channel/channel";

/**
 * Client interface to be implemented anything that represent a client
 *
 * @property {string} hostname Hostname of the server
 * @property {IServer} server Server instance
 * @property {PacketHandler} packetHandler Packet handler of the client
 * @property {string} username Username of the client
 * @property {string} identifier Identifier of the client (username@hostname)
 *
 * @property {void} send Send a message to the client {@link IClient.send}
 * @property {void} write Write a message to the client {@link IClient.write}
 * @property {Observable<string>} observe Watch for incoming packets from the client {@link IClient.observe}
 * @property {Promise<void>} introduce Introduce the client to a channel {@link IClient.introduce}
 */
export interface IClient {
    hostname: string;
    server: IServer;
    packetHandler: PacketHandler;
    username: string;
    identifier: string;

    send(msg: TextMessage): void;

    write(msg: string | Packet): void;

    observe(): Observable<string>;

    introduce(channel: IChannel): Promise<void>;
}

export class Client extends Transceiver implements IClient {
    public hostname: string;
    public readonly server: Server;
    public readonly packetHandler: PacketHandler;

    /**
     *
     * @param {Socket} socket Socket of this client
     * @param {IServer<IClient>} server Server the client is on
     * @param alias Alias of a server, in most cases a domain to identify the server (optional)
     */
    constructor(server: Server, socket: Socket, alias?: string) {
        socket.setKeepAlive(true, 5000);
        super(socket);
        this.server = server;
        this.hostname = alias !== undefined ? alias : (socket.remoteAddress !== undefined ? socket.remoteAddress : "unknown");
        this.packetHandler = new PacketHandler(this.server, this);
    }

    private _username: string = "*";

    get username(): string {
        return this._username;
    }

    /**
     * Set the username of the client
     *
     * @param name Username of the client
     *
     * @returns {void}
     */
    set username(name: string) {
        this._username = name;
    }

    /**
     * @returns {string} Identifier of the client (username@hostname)
     */
    get identifier(): string {
        return `${this._username}@${this.hostname}`;
    }

    public async send(msg: TextMessage) {
        await this.write(msg.content);
    }

    public async write(data: string | Packet) {
        await super.write(data);
    }

    /**
     * Observe the client for incoming packets
     *
     * @returns {Observable<string>} Observable of incoming packets
     */
    public observe(): Observable<string> {
        return new Observable(subscriber => {
            this.socket.on("data", data => {
                subscriber.next(data.toString());
            })
        });
    }

    /**
     * Sends an introduction packet to all clients in a channel
     *
     * @param channel Channel to introduce the client to. Implements {@link IChannel}
     *
     * @returns {Promise<void>}
     */
    public async introduce(channel: IChannel) {
        await Promise.all(channel.clients.map(client =>
            client.write(client.packetHandler.write(new PacketBuilder().setOpcode(opcodes.INTRODUCE).setData({
                username: this.username,
                identifier: this.identifier,
                server: {
                    hostname: this.server.hostname,
                    version: this.server.version
                }
            }).build()).toString())));
    }
}