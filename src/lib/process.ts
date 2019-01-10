export function stopGracefullyOnKill (p: NodeJS.Process, callback: (err?) => void): void {
    process.once('SIGUSR2', () => {
        callback();
        process.kill(process.pid, 'SIGUSR2');
    });

    process.on('uncaughtException', (err) => {
        callback(err);
        process.kill(process.pid, 'SIGINT');
    });
}
