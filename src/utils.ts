import {Spring} from "plumbing-toolkit";

export function listen<T>(stream: NodeJS.ReadableStream): Spring<T> {
    return sink => {
        const onerr = (err: Error) => sink.error(err)
        const onclose = () => sink.complete();
        const ondata = (data: T) => sink.next(data);

        stream.once("error", onerr);
        stream.once("close", onclose);
        stream.on("data", ondata);

        return () => {
            stream.off("error", onerr);
            stream.off("close", onclose);
            stream.off("data", ondata);
        }
    };
}