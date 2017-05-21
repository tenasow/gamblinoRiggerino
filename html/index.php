<!DOCTYPE html>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<script src="/node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js"></script>
<link rel="stylesheet" href="views/layout.css">
  <body>
    <div class="content">
      Totally not rigged gambling cs:go site xd

      <br><br>
      <input id="nameValue" type="textbox" placeholder="set name">
      <input type="button" value="set" onclick="setName();">
      <br>

    </br>
    money: <span id="money"></span><br>

    state: <span id="state"></span><br>

    roll: <span id="rollValue"></span>


    <br><br>
    <input id="betValue" type="textbox" placeholder="Bet Amount">
    <input type="button" value="BET" onclick="betMoney();"><br>
    <input type="button" value="reset" onclick="resetMoney();">
    <br><br>
    Toppest of keks lads:<br>

    <span id="leaderboard"></span>

  </div>
  <script>
   var socket = io.connect('https://topkek.dk:8080', { secure:true });

   socket.on('leaderboard', (data)=>{
     var htmlOutput = '<table id="leaderboardTable">';
     htmlOutput += '<tr><th>Player</th>';
     htmlOutput += '<th>Money</th></tr>';
     for (var i = 0; i < data['players'].length; i++) {

       htmlOutput += '<tr><td>';
       htmlOutput += data['players'][i][0] + "</td><td>";
       htmlOutput += data['players'][i][1];
       htmlOutput += '</td></tr>';
     }

     htmlOutput += '</table>';

     $('#leaderboard').html(htmlOutput);
   });

   socket.on('user', function(data) {

      var user = {id: data['id'], state: data['waiting'], money: data['money'], bet: data['bet']};

      $('#money').html(data['money']);
      $('#state').html(data['state']);
      $('#rollValue').html(data['bet']);

   });

  socket.on('money', function(data) {
    $('#number').html(data['money']);
  });

  function betMoney(){
    socket.emit("bet", {bet: $('#betValue').val()});
  }

  function resetMoney(){
    socket.emit("reset", {});
  }

  function setName(){
    socket.emit('name', {name: $('#nameValue').val()});
  }

  </script>
  </body>
</html>
