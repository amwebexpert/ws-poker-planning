"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.service = void 0;
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
        switch (message.type) {
            case 'reset':
                state.lastUpdate = new Date();
                state.estimates = state.estimates.map(function (e) { return ({ username: e.username }); });
                break;
            case 'vote':
                state.lastUpdate = new Date();
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