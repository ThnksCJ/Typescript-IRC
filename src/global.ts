import {Logger} from 'sitka';

export namespace logger {
    export const global = Logger.getLogger({name: "IRC", format: '[${LEVEL}] [${NAME}] ${MESSAGE}'});
    export const network = Logger.getLogger({name: "IRC.Network", format: '[${LEVEL}] [${NAME}] ${MESSAGE}'});
    export const server = Logger.getLogger({name: "IRC.Server", format: '[${LEVEL}] [${NAME}] ${MESSAGE}'});
}