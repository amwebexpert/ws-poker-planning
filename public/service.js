"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = void 0;
var isAutoCloseSocketsAfterDelay = false;
var PokerPlanningService = /** @class */ (function () {
    function PokerPlanningService() {
        this.rooms = new Map();
    }
    PokerPlanningService.prototype.addClient = function (roomUUID, socket) {
        var _this = this;
        if (!this.rooms.has(roomUUID)) {
            console.log('creating room', roomUUID);
            this.rooms.set(roomUUID, this.createRoom(roomUUID));
        }
        var room = this.rooms.get(roomUUID);
        room.members.add(socket);
        socket.on('message', function (value) { return _this.handleMessage(roomUUID, value); });
        socket.on('close', function () { return _this.close(roomUUID, socket); });
        // send current state
        var data = JSON.stringify(room.state);
        socket.send(data);
        if (isAutoCloseSocketsAfterDelay) {
            setTimeout(function () { return socket.close(); }, 5000);
        }
    };
    PokerPlanningService.prototype.createRoom = function (roomUUID) {
        return {
            uuid: roomUUID,
            members: new Set(),
            state: {
                lastUpdate: new Date(),
                estimates: [],
            },
        };
    };
    PokerPlanningService.prototype.handleMessage = function (roomUUID, value) {
        var message = JSON.parse("".concat(value));
        console.log('Server side handleMessage', { roomUUID: roomUUID, message: message });
        var room = this.rooms.get(roomUUID);
        if (!room) {
            console.log('room not found', roomUUID);
            return;
        }
        var state = room.state;
        state.lastUpdate = new Date();
        switch (message.type) {
            case 'reset':
                state.estimates = state.estimates.map(function (e) { return ({ username: e.username }); });
                break;
            case 'remove':
                var userToRemove_1 = message.payload;
                state.estimates = state.estimates.filter(function (e) { return e.username !== userToRemove_1; });
                break;
            case 'vote':
                var newEstimate_1 = message.payload;
                var oldEstimateIndex = state.estimates.findIndex(function (e) { return e.username === newEstimate_1.username; });
                if (oldEstimateIndex === -1) {
                    state.estimates.push(newEstimate_1);
                }
                else {
                    state.estimates[oldEstimateIndex] = newEstimate_1;
                }
                break;
            default:
                console.error('unhandled message type', message.type);
                break;
        }
        // broadcast state to all room members
        var data = JSON.stringify(state);
        room.members.forEach(function (client) { return client.send(data); });
    };
    PokerPlanningService.prototype.close = function (roomUUID, socket) {
        var room = this.rooms.get(roomUUID);
        if (!room) {
            return;
        }
        socket.removeAllListeners();
        room.members.delete(socket);
    };
    return PokerPlanningService;
}());
exports.service = new PokerPlanningService();
//# sourceMappingURL=service.js.map