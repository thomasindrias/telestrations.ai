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
    clearCanvas();
    this.show('draw-state');
  }

  AIState() {
    this.show('ai-state');

    // Get prediction
    var keyword = getFrame();

    // If player draws so bad so AI cant predict, continue with a random word
    if (keyword === null) {
      const random = Math.floor(Math.random() * categories.length);
      keyword = categories[random];
    }

    const randomImg = Math.floor(Math.random() * 10);
    const url = 'https://api.unsplash.com/search/photos';

    $.ajax({
      url: url,
      method: 'GET',
      data: {
        query: keyword,
        'per_page': 10
      },
      headers: {
        "Authorization": 'Client-ID ' + APIKEY
      }
    }).done(data => {
      console.log(data);
      var image = document.getElementById('img-pred');
      image.src = data.results[randomImg].urls.small;

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