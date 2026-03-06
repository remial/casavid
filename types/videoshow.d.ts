declare module 'videoshow' {
    interface VideoShowOptions {
        fps?: number;
        loop?: number;
        transition?: boolean;
        transitionDuration?: number;
        videoBitrate?: number;
        videoCodec?: string;
        size?: string;
        format?: string;
        pixelFormat?: string;
    }

    function videoshow(
        paths: string[],
        options: VideoShowOptions
    ): {
        save(output: string): {
            on(event: 'start' | 'error' | 'end', callback: (command?: string, err?: any, stdout?: any, stderr?: any) => void): void;
        };
    }

    export default videoshow;
}
