import {Client} from "../network/client";
import {IChannel} from "../channel/channel";

/**
 * Represents a text message sent from one client to another.
 *
 * @property {string} toString Get a string representation of the message
 * @property {Client} sender Sender of the message
 * @property {Client} recipient Recipient of the message
 * @property {string} content Content of the message
 * @property {Date} timestamp Timestamp of the message
 *
 * @example
 * const message = new Message(sender, recipient, content);
 * console.log(message.toString()); // 12:00:00 <sender> content
 */
export class TextMessage {
    private readonly _sender: Client;
    private readonly _recipient: Client | IChannel;
    private readonly _content: string;
    private readonly _timestamp: Date;

    /**
     * Create a new Message.
     *
     * @param sender Sender of the message (Always a {@link Client})
     * @param content Content of the message
     * @param recipient Recipient of the message (Can be either a {@link Client} or {@link IChannel})
     */
    constructor(sender: Client, content: string, recipient: Client | IChannel) {
        this._sender = sender;
        this._recipient = recipient;
        this._content = content;
        this._timestamp = new Date();
    }

    get recipient(): Client | IChannel {
        return this._recipient;
    }

    get sender(): Client {
        return this._sender;
    }

    get content(): string {
        return this._content;
    }

    get timestamp(): Date {
        return this._timestamp;
    }

    /**
     * Get a string representation of the message.
     *
     * @returns {string} String representation of the message in the format ``HH:MM:SS <sender> content``
     */
    public toString(): string {
        return `${this.timestamp.toLocaleTimeString()} <${this.sender.identifier}> ${this.content}`;
    }
}

/**
 * Builder for Message objects.
 *
 * @example
 * const message = new MessageBuilder(sender)
 *    .to(recipient)
 *    .setContent(content)
 *    .build();
 */
export class TextMessageBuilder {
    private readonly sender: Client;
    private recipient: Client | IChannel;
    private content: string;

    /**
     * Create a new MessageBuilder.
     *
     * @param sender Sender of the message (Always a {@link Client})
     */
    constructor(sender: Client) {
        this.sender = sender;
    }

    /**
     * Set the recipient of the message.
     *
     * @param recipient This can be either a {@link Client} or a {@link IChannel}.
     * @returns {TextMessageBuilder} This builder instance
     */
    public to(recipient: Client | IChannel): TextMessageBuilder {
        this.recipient = recipient;
        return this;
    }

    /**
     * Set the content of the message.
     *
     * @param content Content of the message
     *
     * @returns {TextMessageBuilder} This builder instance
     */
    public setContent(content: string): TextMessageBuilder {
        this.content = content;
        return this;
    }

    /**
     * Build the message.
     *
     * @returns {TextMessage} Message instance
     */
    public build(): TextMessage {
        return new TextMessage(this.sender, this.content, this.recipient);
    }
}