class Player {
  constructor(name, bot = false) {
    this.bot = bot;
    this.name = name;
    this.img = null;
    this.keyword = null;
  }
}
class GameState {
  constructor(players) {
    this.players = players;
    this.history = [];
    this.playerIndex = 0;
    this.state = 0;
    this.stateID = ["draw-state", "ai-state", "guess-state", "end-state"];
  }

  showPlayerState() {
    document.getElementById("playerIndex").innerText = this.players[
      this.playerIndex
    ].name;
    document
      .getElementById("display-player-state")
      .style.setProperty("display", "block", "important");
  }

  drawState() {
    clearCanvas();
    this.showPlayerState();

    if (this.playerIndex === 0) {
      // If the first player, take a random keyword to draw
      const random = Math.floor(Math.random() * categories.length);
      this.players[this.playerIndex].keyword = categories[random]
        .split("_")
        .join(" ");
    } else {
      // Get previous player's keyword.
      this.players[this.playerIndex - 1].keyword = document.getElementById(
        "input-guess"
      ).value;
      document.getElementById("input-guess").value = "";

      this.players[this.playerIndex - 1].img = this.history[
        this.history.length - 1
      ].img;

      // Push previous player into history
      this.history.push(this.players[this.playerIndex - 1]);

      // Take the keyword from the latest player (previous player)
      this.players[this.playerIndex].keyword = this.history[
        this.history.length - 1
      ].keyword;
    }

    document.getElementById("draw-keyword").innerText = this.players[
      this.playerIndex
    ].keyword;

    this.show("draw-state");
  }

  AIState() {
    this.show("ai-state");
    var bot = new Player("AI", true);

    // Save canvas as image for previous player (done here so the player get's to finish drawing)
    // (img src type)
    this.players[this.playerIndex - 1].img = saveCanvas();
    this.history.push(this.players[this.playerIndex - 1]);

    // Get prediction and save as a keyword for the bot
    bot.keyword = getFrame();

    // If player draws so bad so AI cant predict, continue with a random word
    if (bot.keyword === null) {
      const random = Math.floor(Math.random() * categories.length);
      bot.keyword = categories[random].split("_").join(" ");
    }

    const randomImg = Math.floor(Math.random() * 10);
    const url = "https://api.unsplash.com/search/photos";

    $.ajax({
      url: url,
      method: "GET",
      data: {
        query: bot.keyword[0].keyword,
        per_page: 10,
      },
      headers: {
        Authorization: "Client-ID " + APIKEY,
      },
    })
      .done((data) => {
        console.log(data);
        var image = document.getElementById("img-pred");
        image.src = data.results[randomImg].urls.small;

        //save for presentation (img href type)
        bot.img = data.results[randomImg].urls.small;
        this.history.push(bot);

        setTimeout(() => {
          stateHandler();
        }, 3000);
      })
      .fail((err) => {
        throw err;
      });
  }

  guessState() {
    this.showPlayerState();

    this.show("guess-state");
  }

  endState() {
    document
      .getElementById("exit-button")
      .style.setProperty("display", "none", "important");
    // LOOP THROUGH HISTORY TO PRESENT THEM.
    this.history.forEach((player, i) => {
      var title = `<span class="font-weight-bold">${player.name}'s</span> turn`;

      var description = `<span class="font-weight-bold">${player.name}</span>`;
      if (i % 3 == 0)
        description += ` got the keyword <span class="text-primary font-weight-bold">${player.keyword}</span> and drew the picture below.`;
      else if (i % 3 == 1) {
        var tableItems = "";
        player.keyword.forEach((keyword, i) => {
          tableItems += `
            <tr>
              <th scope="row">${i + 1}</th>
              <td>${keyword.keyword}</td>
              <td>${keyword.prob}%</td>
            </tr>
          `;
        });

        description += ` 
        got the drawing above and guessed 
        <span class="text-primary font-weight-bold">${player.keyword[0].keyword}</span>. 
        Then gave the picture below.<br>
        The top 5 guesses are: 
        <table class="table table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Keyword</th>
              <th scope="col">Probability</th>
            </tr>
          </thead>
          <tbody>
            ${tableItems}
          </tbody>
        </table>`;
      } else
        description += ` got the picture below and guessed <span class="text-primary font-weight-bold">${player.keyword}</span>.`;

      var cardComponent = `<div class="card mx-auto p-2 m-2" style="width: 24rem;"><div class="card-body"><h5 class="card-title">${title}</h5><p class="card-text">${description}</p></div>${(i % 3 === 2) ? '' : `<img class="card-img-bottom" src="${player.img}" alt="Error, no image :(">`}</div>`;

      document
        .getElementById("presentation-cards")
        .insertAdjacentHTML("beforeend", cardComponent);
    });

    this.show("end-state");
  }

  show(id) {
    // Show the chosen ID
    this.stateID.forEach((state) => {
      if (id === state)
        document
          .getElementById(state)
          .style.setProperty("display", "block", "important");
      else
        document
          .getElementById(state)
          .style.setProperty("display", "none", "important");
    });
  }

  restart() {
    console.log("restart");

    document
      .getElementById("welcome-state")
      .style.setProperty("display", "block", "important");
    document
      .getElementById("game-state")
      .style.setProperty("display", "none", "important");

    document
      .getElementById("display-player-state")
      .style.setProperty("display", "none", "important");

    //$("#players").empty();

    $("#presentation-cards").empty();

    document.getElementById("input-guess").value = "";


    this.players = [];
    this.history = [];
    this.playerIndex = 0;
    this.state = 0;
  }
}