class Player {
    constructor(name) {
        this.name = name;
        this.img = null;
        this.keyword = null;
    }
}

class GameState {
    constructor(players) {
        this.players = players;
        this.playerIndex = 0;
        this.state = 0;
        this.stateID = ['draw-state', 'ai-state', 'guess-state', 'end-state'];
    }

    drawState() {
        this.show('draw-state');


    }

    AIState() {
        this.show('ai-state');

        // Get prediction
        var keyword = getFrame();

        const url = 'https://api.unsplash.com/photos/random';
        $.ajax({
            url: url,
            method: 'GET',
            headers: {
                client_id: APIKEY
            }
        }).done(data => {
            var url = window.URL.createObjectURL(data);
            $("#img-pred").src = url;
        }).fail(err => {
            throw err;
        });
    }

    guessState() {
        this.show('guess-state');

    }

    endState() {
        this.show('end-state');
    }

    show(id) {
        // Show the chosen ID
        this.stateID.forEach(state => {
            if (id === state)
                document.getElementById(state).style.setProperty("display", "block", "important");
            else
                document.getElementById(state).style.setProperty("display", "none", "important");
        });
    }

    restart() {
        console.log("restart");

        document.getElementById('welcome-state').style.setProperty("display", "block", "important");
        document.getElementById('game-state').style.setProperty("display", "none", "important");
        $('#players').empty();

        this.players = [];
        this.playerIndex = 0;
        this.state = 0;
    }
}