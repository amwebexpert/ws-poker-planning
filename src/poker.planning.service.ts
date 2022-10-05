import * as ws from 'ws';
import { APP_VERSION_INFO } from './constants';
import { Room, UserEstimate, UserMessage } from './model';

const isAutoCloseSocketsAfterDelay = false;

class PokerPlanningService {
    private rooms: Map<string, Room> = new Map();

    addClient(roomUUID: string, socket: ws.WebSocket) {
        if (!this.rooms.has(roomUUID)) {
            console.log('creating room', roomUUID);
            this.rooms.set(roomUUID, this.createRoom(roomUUID));
        }

        const room = this.rooms.get(roomUUID)!;
        room.sockets.add(socket);

        socket.on('message', (value: string) => this.handleMessage(roomUUID, value));
        socket.on('close', () => this.close(roomUUID, socket));
        socket.send(JSON.stringify(room.state));

        if (isAutoCloseSocketsAfterDelay) {
            setTimeout(() => socket.close(), 5000);
        }
    }

    private createRoom(roomUUID: string): Room {
        return {
            uuid: roomUUID,
            sockets: new Set<ws.WebSocket>(),
            state: {
                version: APP_VERSION_INFO.VERSION,
                lastUpdateISO8601: new Date().toISOString(),
                estimates: [],
            },
        };
    }

    handleMessage(roomUUID: string, value: string) {
        const message = JSON.parse(`${value}`) as UserMessage;
        console.log('Server side handleMessage', { roomUUID, message });

        const room = this.rooms.get(roomUUID);
        if (!room) {
            console.log('room not found', roomUUID);
            return;
        }

        const { state } = room;
        state.lastUpdateISO8601 = new Date().toISOString();

        switch (message.type) {
            case 'reset':
                state.estimates = state.estimates.map(e => ({ username: e.username }));
                break;

            case 'remove':
                const userToRemove: string = message.payload as string;
                state.estimates = state.estimates.filter(e => e.username !== userToRemove);
                break;

            case 'vote':
                const newEstimate = message.payload as UserEstimate;
                const oldEstimateIndex = state.estimates.findIndex(e => e.username === newEstimate.username);
                if (oldEstimateIndex === -1) {
                    state.estimates.push(newEstimate);
                } else {
                    state.estimates[oldEstimateIndex] = newEstimate;
                }
                break;

            default:
                console.error('unhandled message type', message.type);
                break;
        }

        // broadcast state to all room members
        const data = JSON.stringify(state);
        room.sockets.forEach(client => client.send(data));
    }

    close(roomUUID: string, socket: ws.WebSocket): void {
        socket.removeAllListeners();

        const room = this.rooms.get(roomUUID);
        if (room) {
            room.sockets.delete(socket);
        }
    }
}

export const pokerPlanningService = new PokerPlanningService();
