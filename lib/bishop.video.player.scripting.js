/**
 * BishopPlayer object constructor
 * Exposes methods for controlling a video player embedded in an iframe using postMessage
 */
function BishopPlayer(playerId, frame, events) {
    this.playerId = playerId.toString();
    this.frame = frame;
    this.events = events;
    
    // register methods for controling video playback
    this.play = function() {
        pm({
            target: this.frame.contentWindow,
            type: 'play'
        });
    };
    this.pause = function() {
        pm({
            target: this.frame.contentWindow,
            type: 'pause'
        });
    };
    this.stop = function() {
        pm({
            target: this.frame.contentWindow,
            type: 'stop'
        });
    };
    this.volume = function(level) {
        pm({
            target: this.frame.contentWindow,
            type: 'volume',
            data: { level: level }
        });
    };
    
    this.onPlay = function(handler) {
        pm.unbind(this.playerId + 'playing', this.events.play);
        this.events.play = handler;
        pm.bind(this.playerId + 'playing', this.events.play);
    };
    this.onPause = function(handler) {
        pm.unbind(this.playerId + 'pause', this.events.pause);
        this.events.pause = handler;
        pm.bind(this.playerId + 'pause', this.events.pause);
    };
    this.onStop = function(handler) {
        pm.unbind(this.playerId + 'stop', this.events.stop);
        this.events.stop = handler;
        pm.bind(this.playerId + 'stop', this.events.stop);
    }
    this.onVolume = function(handler) {
        pm.unbind(this.playerId + 'volume', this.events.volume);
        this.events.volume = handler;
        pm.bind(this.playerId + 'volume', this.events.volume);
    }
}