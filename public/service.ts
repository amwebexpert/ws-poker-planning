import * as ws from 'ws';
import { Room, UserEstimate, UserMessage } from './model';

class PokerPlanningService {
    private rooms: Map<string, Room> = new Map();

    addClient(roomUUID: string, socket: ws.WebSocket) {
        if (!this.rooms.has(roomUUID)) {
            console.log('creating room', roomUUID);
            this.rooms.set(roomUUID, this.createRoom(roomUUID));
        }

        const room = this.rooms.get(roomUUID)!;
        room.members.add(socket);

        socket.on('message', (value: string) => this.handleMessage(roomUUID, value));
        socket.on('close', () => this.close(roomUUID, socket));

        // send current state
        const data = JSON.stringify(room.state.estimates);
        socket.send(data);
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
        const message = JSON.parse(`${value}`) as UserMessage;
        // console.log('Server side onMessage:::', { roomUUID, message });

        const room = this.rooms.get(roomUUID);
        if (!room) {
            console.log('room not found', roomUUID);
            return;
        }

        switch (message.type) {
            case 'reset':
                room.state.lastUpdate = new Date();
                room.state.estimates = room.state.estimates.map(e => ({ username: e.username }));
                break;

            case 'vote':
                room.state.lastUpdate = new Date();
                const newEstimate = message.payload as UserEstimate;
                const oldEstimateIndex = room.state.estimates.findIndex(e => e.username === newEstimate.username);
                if (oldEstimateIndex === -1) {
                    room.state.estimates.push(newEstimate);
                } else {
                    room.state.estimates[oldEstimateIndex] = newEstimate;
                }
                break;

            default:
                console.error('unhandled message type', message.type);
                break;
        }

        // broadcast state to all room members
        const data = JSON.stringify(room.state.estimates);
        room.members.forEach(client => client.send(data));
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
