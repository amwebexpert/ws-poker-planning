import * as ws from 'ws';
import { Room } from './model';

class PokerPlanningService {
    private rooms: Map<string, Room> = new Map();

    addClient(roomUUID: string, socket: ws.WebSocket) {
        if (!this.rooms.has(roomUUID)) {
            console.log('creating room', roomUUID);
            this.rooms.set(roomUUID, this.createRoom(roomUUID));
        }

        console.log('adding member to room', roomUUID);
        const room = this.rooms.get(roomUUID)!;
        room.members.add(socket);

        socket.on('message', (value: string) => this.handleMessage(roomUUID, value));
        socket.on('close', () => this.close(roomUUID, socket));
    }

    private createRoom(roomUUID: string): Room {
        return {
            uuid: roomUUID,
            members: new Set(),
            state: {
                lastUpdate: new Date(),
                estimates: [],
            },
        };
    }

    handleMessage(roomUUID: string, value: string) {
        const message = `${value}`;
        console.log('Server side onMessage:::', {roomUUID, message});

        const room = this.rooms.get(roomUUID);
        if (!room) {
            console.log('no room clients', roomUUID);
            return;
        }

        // broadcast to all room members
        room.members.forEach(client => client.send(message));
    }

    close(roomUUID: string, socket: ws.WebSocket): void {
        const room = this.rooms.get(roomUUID);
        if (!room) {
            return;
        }

        socket.removeAllListeners();
        room.members.delete(socket);
    }
}

export const service = new PokerPlanningService();
