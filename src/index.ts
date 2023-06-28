import {logger} from "./global";
import {Server} from "./network/server";

(async () => {
    logger.global.info('Starting irc chat...');

    const server = new Server(8765);

    await server.start();
})();