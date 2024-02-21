var Leaderboard = pc.createScript('leaderboard');

Leaderboard.prototype.initialize = function() {
    this.network = this.app.root.children[0].script.network;
};

Leaderboard.prototype.update = function() {
    this.lb = this.network.lb.filter(value => this.network.players.find(player => player && player.id == value.ID));
    this.lb.sort((a, b) => b.score - a.score || a.ID - b.ID);
    for (let i = 0; i < 10; i++) {
        let data = this.lb[i];
        let element = this.entity.children[i+2].element;
        if (data) {
            element.enabled = true;
            element.text = `${this.network.players[data.ID].nickname} - ${data.score}`;
            element.color = data.ID == this.network.id ? pc.Color.YELLOW : pc.Color.WHITE;
        } else {
            element.enabled = false;
        }
    }
};