import * as ws from 'ws';
import { APP_VERSION_INFO } from './constants';
import {
    PokerPlanningSession,
    Room,
    UserMessage,
    UserMessageEstimate,
    UserSocket,
    isUserMessageEstimate,
    isUserMessageRemove,
    isUserMessageReset,
} from './model';

const INACTIVITY_DELAY_SECONDS = 60;

type AddClientArgs = {
    roomUUID: string;
    socket: ws.WebSocket;
    browser: string;
    ip: string;
};

type CloseSocketArgs = {
    roomUUID: string;
    userSocket: UserSocket;
};

type HandleMessageArgs = {
    roomUUID: string;
    value: string;
};

type RecordNewEstimateArgs = {
    message: UserMessageEstimate;
    state: PokerPlanningSession;
};

type ParseIncomingMessage = {
    value: string;
    roomUUID: string;
};

class PokerPlanningService {
    private rooms: Map<string, Room> = new Map();

    addClient({ roomUUID, socket, browser, ip }: AddClientArgs) {
        if (!this.rooms.has(roomUUID)) {
            this.rooms.set(roomUUID, this.createRoom(roomUUID));
        }

        const userSocket: UserSocket = { socket, browser, ip };
        const room = this.rooms.get(roomUUID)!;
        room.sockets.add(userSocket);

        socket.on('message', (value: string) => this.handleMessage({ roomUUID, value }));
        socket.on('close', () => this.close({ roomUUID, userSocket }));
        socket.send(JSON.stringify(room.state));

        // auto-close socket after a given delay
        setTimeout(() => socket.close(), INACTIVITY_DELAY_SECONDS * 1000);
    }

    private createRoom(roomUUID: string): Room {
        console.log(`\tcreating room ${roomUUID}`);

        return {
            uuid: roomUUID,
            sockets: new Set<UserSocket>(),
            state: {
                version: APP_VERSION_INFO.VERSION,
                lastUpdateISO8601: new Date().toISOString(),
                estimates: [],
            },
        };
    }

    private handleMessage({ roomUUID, value }: HandleMessageArgs) {
        const room = this.rooms.get(roomUUID);
        if (!room) {
            console.log(`room not found: ${roomUUID}`);
            return;
        }

        const message = this.parseIncomingMessage({ value, roomUUID });
        if (!message) {
            return;
        }

        const { state } = room;
        state.lastUpdateISO8601 = new Date().toISOString();

        if (isUserMessageReset(message)) {
            state.estimates = state.estimates.map(e => ({ username: e.username }));
        } else if (isUserMessageRemove(message)) {
            state.estimates = state.estimates.filter(e => e.username !== message.payload);
        } else if (isUserMessageEstimate(message)) {
            this.recordNewEstimate({ message, state });
        } else {
            console.error(`unhandled message type ${message.type}`);
        }

        // broadcast state to all room members
        const data = JSON.stringify(state);
        room.sockets.forEach(({ socket }) => socket.send(data));
    }

    private parseIncomingMessage({ value, roomUUID }: ParseIncomingMessage) {
        const text = `${value}`;
        console.log(`\tincoming message for room ${roomUUID}: ${text}`);

        try {
            const message = JSON.parse(text) as UserMessage;
            return message;
        } catch (error) {
            console.error('failed to parse incoming message', error);
            return null;
        }
    }

    private recordNewEstimate({ message, state }: RecordNewEstimateArgs) {
        const newEstimate = message.payload;
        const oldEstimateIndex = state.estimates.findIndex(e => e.username === newEstimate.username);
        if (oldEstimateIndex === -1) {
            state.estimates.push(newEstimate);
        } else {
            state.estimates[oldEstimateIndex] = newEstimate;
        }
    }

    private close({ roomUUID, userSocket }: CloseSocketArgs): void {
        userSocket.socket.removeAllListeners();
        this.rooms.get(roomUUID)?.sockets.delete(userSocket);
    }
}

export const pokerPlanningService = new PokerPlanningService();
