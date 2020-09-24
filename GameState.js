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
  }

  stateHandler() {
    if (this.playerIndex + 1 === this.players.length)
      this.endState();

    if (this.state === 0) {
      console.log("Draw State", this.players[this.playerIndex]);

      this.playerIndex++;
    }

    if (this.state === 1) {
      console.log("AI State");

    }

    if (this.state === 2) {
      console.log("Guess State", this.players[this.playerIndex]);

      this.playerIndex++;
    }


    this.state++;
    this.state = this.state % 3;
  }

  drawState() {

  }

  AIState() {

  }

  guessState() {

  }

  endState() {

  }
}