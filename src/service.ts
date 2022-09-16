import * as ws from 'ws';

class PokerPlanningService {
    private rooms: Map<string, Set<ws.WebSocket>> = new Map();

    addClient(roomUUID: string, socket: ws.WebSocket) {
        if (!this.rooms.has(roomUUID)) {
          console.log('creating room', roomUUID);
          this.rooms.set(roomUUID, new Set());
        }

        console.log('addClient to room', roomUUID);
        this.rooms.get(roomUUID)!.add(socket);

        socket.on('message', (value: string) => this.broadcast(roomUUID, value));
        socket.on('close', () => this.close(roomUUID, socket));
    }

    broadcast(roomUUID: string, value: string) {
        const message = `${value}`;
        console.log('Server side onMessage:::', message);

        const roomClients = this.rooms.get(roomUUID);
        if (!roomClients) {
            console.log('no room clients', roomUUID);
            return;
        }

        roomClients.forEach(client => client.send(message));
    }

    close(roomUUID: string, socket: ws.WebSocket): void {
        const roomClients = this.rooms.get(roomUUID);
        if (!roomClients) {
            return;
        }

        socket.removeAllListeners();
        roomClients.delete(socket);
    }
}

export const service = new PokerPlanningService();
