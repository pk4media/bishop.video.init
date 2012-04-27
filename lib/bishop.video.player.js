/**
 * BishopPlayer object constructor
 * Exposes methods for controlling a video player embedded in an iframe using postMessage
 */
function BishopPlayer(playerId, frame, events) {
    this.playerId = playerId.toString();
    this.frame = frame;
    this.events = events;
}