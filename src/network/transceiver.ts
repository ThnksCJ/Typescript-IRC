import {Socket} from "net";
import {Pipe} from "plumbing-toolkit";
import {listen} from "../utils";
import {Packet} from "./communication/packet";

/**
 * Transceiver is wrapper around a socket.
 */
export class Transceiver extends Pipe<string> {
    socket: Socket;

    /**
     * Creates an instance of Transceiver.
     *
     * @param {Socket} socket The socket to wrap.
     */
    constructor(socket: Socket) {
        super(listen(socket));
        this.socket = socket;
    }

    public async throw(err: Error) {
        await this.return();
    }

    public async return() {
        this.socket.end();
        this.socket.destroy();
    }

    public async write(data: string | Packet) {
        this.socket.write((data instanceof Packet ? data.raw : data) + "\n");
    }
}