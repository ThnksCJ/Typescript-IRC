import {createServer, Server as NetServer, Socket} from "net";
import {Client, IClient} from "./client";
import {IChannel} from "../channel/channel";
import {logger} from "../global"
import {PacketHandler} from "./communication/packetHandler";
import {RoomChannel} from "../channel/impl/room";

export interface IServer<T extends IClient = IClient, K extends IChannel = IChannel> {
    port: number;
    server: NetServer;
    packetHandler: PacketHandler;
    clients: T[];
    channels: K[];
    hostname: string;
    created: Date;
    version: string;

    onConnection(socket: Socket): Promise<void>;

    start(): Promise<void>;

    getClients(): Promise<Client[]>;

    broadcast(msg: string): Promise<Awaited<void>[]>;
}

export class Server implements IServer {
    public readonly port: number;
    public readonly server: NetServer
    public readonly packetHandler: PacketHandler;
    public readonly clients: Client[] = [];
    public readonly channels: IChannel[] = [];
    public readonly hostname: string;
    public readonly created: Date;
    public readonly version: string = "0.0.1";

    constructor(port: number, hostname: string = "localhost") {
        this.port = port;
        this.hostname = hostname;
        this.server = createServer();
        this.created = new Date();
        this.packetHandler = new PacketHandler(this);

        this.channels.push(new RoomChannel("Lobby", this));

        this.server.on("connection", this.onConnection.bind(this));
        this.server.on("close", this.resolve.bind(this));
    }

    public async onConnection(socket: Socket) {
        const client = new Client(this, socket, "localhost");
        this.clients.push(client);
        logger.server.info(`${client.identifier} connected.`);

        await client.observe().subscribe(data => this.packetHandler.handle(data, client));

        socket.on("error", () => this.onSocketClose.bind(this)(client));
        socket.on("end", () => this.onSocketClose.bind(this)(client));
    }

    public async onSocketClose(client: Client) {
        logger.server.info(`${client.identifier} disconnected.`);
        this.clients.splice(this.clients.indexOf(client), 1);
    }

    public async start() {
        this.server.listen(this.port);
        logger.server.info(`Awaiting TCP connections on port ${this.port}.`);

        return new Promise<void>((resolve) => this.resolve = resolve);
    }

    public async broadcast(msg: string): Promise<Awaited<void>[]> {
        logger.server.info(`Broadcasting message to ${this.clients.length} clients...`);
        return Promise.all(this.clients.map(client => client.write(msg)));
    }

    public async getClients(): Promise<Client[]> {
        return Promise.resolve(this.clients);
    }

    /**
     * A promise that resolves when the server is closed.
     */
    private resolve: () => void = () => {
    };
}