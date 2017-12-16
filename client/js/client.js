var socket = io();
var serverConnected = false;
var player = {score:0};
var riseAmount = 1;
var additionScore = 0;
var maxAdditionScore = 1;

var interval = 10;
var times = 0;

function Update() {
  if (times == 0) {
    additionScore+=riseAmount;
    if (additionScore>maxAdditionScore) {
      maxAdditionScore=additionScore;
    }
  }
}

function Render() {
  var addScoreProgress = $('#add-score-progress');

  $('#player-name').text(player.name);
  $('#player-score').text(player.score);
  addScoreProgress.text(additionScore);

  var percent = (additionScore)/maxAdditionScore*100
  var percent = percent>=100?100:percent;

  addScoreProgress.css("width", percent+ "%");
}

function loop() {
  if (times * (interval==0?1:interval)==1000) {
    times = 0;
  }
  Update();
  Render();
  times++;
}

socket.on("server-connected", function (id) {
  player.id = id;
  serverConnected = true;
  $("#server-connecting").modal("toggle");
  $("#enter-name").modal("toggle");
});
socket.on("update-players", function (players) {
  console.table(players);
  if (players[0] !==undefined) {
    maxAdditionScore = players[0].score;
  }
  riseAmount = players.length;
  var leaderboard = $("#leaderboard");
  leaderboard.empty();
  players.forEach(function (p,i) {
    var active = p.id == player.id?' active':'';

    leaderboard.append('<li class="list-group-item' + active + '">' + (i + 1) + '. ' + p.name + ' <span class="badge">' + p.score + '</span></li>');
  }, this);
});

$(function () {
  $('#add-score-button').click(function () {
    if (serverConnected) {
      player.score += additionScore;
      additionScore = 0;
      socket.emit("save-score", player.score);
    }
  });

  $('#new-username-button').click(function () {
    if (serverConnected) {
      player.name = $('#new-username-text').val();
      if (player.name !== undefined) {
        socket.emit("save-name",player.name);
        $("#enter-name").modal("toggle");
        setInterval(loop, interval);
      }
    }
  });

  $("#server-connecting").modal();
  $("#enter-name").modal({show:false});


  $("#server-connecting").on('hide.bs.modal', function () {
    if (!serverConnected) {
      $("#server-connecting").modal("toggle");
    }
  });
  $("#server-connecting").on('show.bs.modal', function () {
    if (serverConnected) {
      $("#server-connecting").modal("toggle");
    }
  });


  $("#enter-name").on('hide.bs.modal', function () {
    if (player.name === undefined) {
      $("#enter-name").modal("toggle");
    }
  });



});
