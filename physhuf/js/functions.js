//**
//
// BUILT UPON KITCHSINK DURING MUSIC HACK DAY STOCKHOLM '13!
// https://github.com/ptrwtts/kitchensink
// HACKED TOGETHER BY PETER LÖFQUIST http://peterlofquist.com               @peterlofquist
//                    WAI SHUN YEONG                                        @waishun
//                    SEBASTIAN ANDREASSON http://sebastian-andreasson.com 
//                    KEES PLATTEL http://ikbenke.es                        @keesplattel
//                    
//**


var socket = io.connect('[YOUR NODE SOCKET.IO URL GOES HERE]');
//var socket = io.connect('http://peterlofquistpan.server.jit.su:80');
var array3 = [];
var nowActive = '1_1';
var hot = '6k87aly7hVbBrbGY5PMwCf';
var key = 'CFWX4WZ71KJAGVH3W';
var trigger = false;

var elArray = ["0_0", "1_0", "2_0", "3_0", "4_0", "0_1", "1_1", "2_1", "3_1", "4_1", "0_2", "1_2", "2_2", "3_2", "4_2", "0_3", "1_3", "2_3", "3_3", "4_3", "0_4", "1_4", "2_4", "3_4", "4_4"];

var activeSong = "";

function playSong(uri) {
  
  player.play("spotify:track:" + uri, "spotify:track:" + uri, 0);
  
}

function nextTrack() {
  
  var randomShuffle = Math.floor(Math.random() * elArray.length);
  var newTarget = elArray[randomShuffle];
  
  var oldTarget = $('.active').attr('id');
  
  $('#' + oldTarget).removeClass('active');
  $('#' + newTarget).addClass('active');
  
  nowActive = newTarget;
  
  getSong();
  
  $('html, body').animate({
    scrollTop: $("#" + nowActive).offset().top
  }, 500);
  
}

function nextSong() {
  var oldTarget = $('.active').attr('id');
  
  for(var i = 0; i < elArray.length; i++) {
    if(elArray[i] == oldTarget) {
      var nextTarget = i + 1;
      $('#' + oldTarget).removeClass('active');
      $('#' + elArray[nextTarget]).addClass('active');
      nowActive = elArray[nextTarget];

      getSong();

      $('html, body').animate({
        scrollTop: $("#" + nowActive).offset().top
      }, 500);
      
    }
  }
  
  
}

function prevSong() {
  var oldTarget = $('.active').attr('id');
  
  for(var i = 0; i < elArray.length; i++) {
    if(elArray[i] == oldTarget) {
      var prevTarget = i - 1;
      $('#' + oldTarget).removeClass('active');
      $('#' + elArray[prevTarget]).addClass('active');
      nowActive = elArray[prevTarget];

      getSong();

      $('html, body').animate({
        scrollTop: $("#" + nowActive).offset().top
      }, 500);
      
    }
  }
}

function pauseSong() {
  player.playing = !(player.playing);
}

$(document).ready(function() { 
  
  socket.on('nextPrev', function(state) {
    if(state == 'next') {
      nextSong();
    }
    else {
      prevSong();
    }
  });
  
  document.onkeydown = checkArrowKeys;
  
  socket.on('playMusic', function() {
    getSong();
  });
  
  socket.on('pauseMusic', function() {
    player.playing = !(player.playing);
  });
  
  socket.emit('activate');
  
  socket.on('moveActive', function(direction) {
    switch(direction) {
      case 'left':
        moveTargetLeft();
      break;
      case 'right':
        moveTargetRight();
      break;
      case 'up':
        moveTargetUp();
      break;
      case 'down':
        moveTargetDown();
      break;
    }
  });
  
  socket.on('shuffleItems', function() {
    console.log('shuffeling');
    setTimeout(function(){
      trigger = false;
    }, 3000);
    
    if(trigger == false) {
      trigger = true;
      shufflePlayingField();
    }
    
  });

  populateBoard();
});

function checkArrowKeys(e){
  var arrs = [], key = window.event? event.keyCode: e.keyCode;
  arrs[37] = 'left';
  arrs[38] = 'up';
  arrs[39] = 'right';
  arrs[40] = 'down';
  arrs[32] = 'space';
  if(arrs[key]) {
    switch(arrs[key]) {
      case 'left':
        e.preventDefault();
        moveTargetLeft();
      break;
      case 'right':
        e.preventDefault();
        moveTargetRight();
      break;
      case 'up':
        e.preventDefault();
        moveTargetUp();
      break;
      case 'down':
        e.preventDefault();
        moveTargetDown();
      break;
      case 'space':
        e.preventDefault();
        getSong();
      break;
    }
  }
}


function getSong() {
  var query = $('.active').attr('rel');
  
  var querySplit = query.split("|");
  
  var url = "http://developer.echonest.com/api/v4/song/search?api_key=" + key + "&format=json&results=1&artist=" + querySplit[0] + "&title=" + querySplit[1] + "&bucket=id:spotify-WW&&bucket=tracks";

  $.ajax({
	  type: "GET",
    url: url,
    contentType: "application/json",
    success: function (data) {
      //console.log(data.response.songs[0].tracks[0].foreign_id);
      
      var result = data.response.songs[0].tracks[0].foreign_id;
      result = result.split(":");
      result = result[2];
      
      
      if(result != activeSong) {
        activeSong = result;
        playSong(result);
      }
      else {
        player.playing = !(player.playing);
      }
    }
  });

}


function shufflePlayingField() {
  
  var url = "http://developer.echonest.com/api/v4/artist/top_hottt?api_key=" + key + "&format=json&results=20&start=0&bucket=songs";
  $.ajax({
	  type: "GET",
    url: url,
    contentType: "application/json",
    success: function (data) {
      
      var randomShuffle = Math.floor(Math.random() * data.response.artists.length);
      var information = data.response.artists[randomShuffle];
      
      randomShuffle = Math.floor(Math.random() * information.songs.length);
      //console.log(information.songs[randomShuffle]);
      
      var url = "http://developer.echonest.com/api/v4/song/search?api_key=" + key + "&format=json&results=1&artist=" + information.name + "&title=" + information.songs[randomShuffle].title + "&bucket=id:spotify-WW&&bucket=tracks";

      $.ajax({
    	  type: "GET",
        url: url,
        contentType: "application/json",
        success: function (data) {
          
          if(data.response.songs[0].tracks[0].foreign_id > "") {
            var result = data.response.songs[0].tracks[0].foreign_id;
            result = result.split(":");
            result = result[2];
            hot = result;
          }

          

          fadeOutBoard();
        }
      });
      
    }
  });
  
 
 
  /*var norSoRandomArray = ["4oUfwAQJZGPufJHHzUNByB", "6k87aly7hVbBrbGY5PMwCf", "7mgaOxJqCvGFG317Q37WWc", "0d28khcov6AiegSCpG5TuT", "4W3Bkljqflf1SD5l2VEtfl", "4o0NjemqhmsYLIMwlcosvW", "6SprCY0xYFC4aLgWSSKSIZ", "0tS3QUlmZOEhTp8gyFae5l", "2VEZx7NWsZ1D0eJ4uv5Fym"];
  
  var randomShuffle = Math.floor(Math.random()*norSoRandomArray.length);
  
  hot = norSoRandomArray[randomShuffle];
  
  fadeOutBoard();*/
}

function fadeOutBoard() {
  var elArray = ["0_0", "1_0", "2_0", "3_0", "4_0", "0_1", "1_1", "2_1", "3_1", "4_1", "0_2", "1_2", "2_2", "3_2", "4_2", "0_3", "1_3", "2_3", "3_3", "4_3", "0_4", "1_4", "2_4", "3_4", "4_4"];
  
  for(var i = 0; i < elArray.length; i++) {
    randomDelay = Math.floor(Math.random() * 1000);
    $('#' + elArray[i]).delay(randomDelay).animate({opacity: 0}, 500); 
  }
  
  setTimeout(function(){
    populateBoard();
  }, 500);
  
}

function populateBoard() {
  
  //playSong(hot);
  
  var url = "http://ws.spotify.com/lookup/1/.json?uri=spotify:track:" + hot;
  
  $.ajax({
	  type: "GET",
    url: url,
    contentType: "application/json",
    success: function (data) {
      var artist = data.track.artists[0].name;

      url = "http://developer.echonest.com/api/v4/artist/search?api_key=" + key + "&format=json&name=" + artist + "&results=1";
      
      $.ajax({
    	  type: "GET",
        url: url,
        contentType: "application/json",
        success: function (data) {
          var id = data.response.artists[0].id;
          
          url = "http://developer.echonest.com/api/v4/artist/similar?api_key=" + key + "&id=" + id + "&format=json&results=65&start=0"
          
          $.ajax({
        	  type: "GET",
            url: url,
            contentType: "application/json",
            success: function (data) {
              var artistArray = [];
              for(var i = 0; i < data.response.artists.length ; i++) {
                
                artistArray[artistArray.length] = data.response.artists[i].id;
                
                //console.log('hello world 2');
                
              }
              
              getSongs(artistArray, key);
              
            }
          });
          
        }
      });
      
    }
  });
  
  
  //spotify:track:5unfeZUhKhICP73CDYBW4N
}

function getSongs(array, key) {

  //http://developer.echonest.com/api/v4/artist/songs?api_key=FILDTEOIK2HBORODV&id=ARH6W4X1187B99274F&format=json&start=0&results=1
  var songArray = [];
  var j = 0;
  
  for(var i = 0; i < array.length; i++) {
    
    $.ajax({
  	  type: "GET",
      url: "http://developer.echonest.com/api/v4/artist/songs?api_key=" + key + "&id=" + array[i] + "&format=json&start=0&results=1",
      contentType: "application/json",
      success: function (data) {
        //console.log(data.response.songs[0].title);
        
        songArray[songArray.length] = data.response.songs[0].id;
        //console.log(input);
        
        j++;
        if(j == array.length) {
          getCovers(songArray, array);
        }
      }
    });
  }
}

function getCovers(array, array2) {
  //console.log('hello');
  
  for(var i = 0; i < array.length; i++) {
    var input = {
      "artist": array2[i],
      "song": array[i]
    }
  
    array3[i] = input;
    if(i == array.length - 1) {
      fix(array3);
    }
    
  }
}

function fix(array) {
  
  var newArray = [];
  var j = 0;
  for(var i = 0; i < array.length; i++) {
    
    $.ajax({
  	  type: "GET",
      url: "http://developer.echonest.com/api/v4/song/profile?api_key=" + key + "&format=json&id=" + array[i].song,
      contentType: "application/json",
      success: function (data) {
      
        newArray[newArray.length] = data.response.songs[0];
        j++
        
        //console.log(j + " " + array.length)
        if(j == array.length) {
          getAlbumCovers(newArray);
        }
      }
    });
  }
  
  var hello = "http://developer.echonest.com/api/v4/song/profile?api_key=" + key + "&format=json&id=";
}

function printBoxes(array) {
  
  $('body').empty();
  
  for(var i = 0; i < 20; i++) {
    var value = "";
    if(i < 5) {
      value = i + "_0";
    }
    else if(i < 10 && i > 4) {
      var xValue = i - 5;
      value = xValue + "_1";
    }
    else if(i < 15 && i > 9) {
      var xValue = i - 10;
      value = xValue + "_2";
    }
    else if(i < 20 && i > 14) {
      var xValue = i - 15;
      value = xValue + "_3";
    }
    else if(i < 50 && i > 49) {
      var xValue = i - 40;
      value = xValue + "_4";
    }


    var output = "<div id='" + value + "' class='item' rel='" + array[i].artist + "|" + array[i].song + "'></div>";
    $('body').append(output);
    //console.log()
    //console.log(array[i].image);
    if(value == nowActive) {
      $('#' + value).addClass('active');
    }
    $('#' + value).css({"opacity": "0",'background-image':"url(" + array[i].image + ")"});
    
    randomDelay = Math.floor(Math.random()*1000);
    
    $('#' + value).delay(randomDelay).animate({opacity: 1}, 500);
    
    
        
    
  }
  
  moveTargetRight();
  
}

function getAlbumCovers(array) {
  
  var tempArray = [];
  var lastfmKey = 'a710fbf71d1c67c8786389160c3029e1';
  var j = 0;
  for(var i = 0; i < array.length; i++) {
    
    var url = "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=" + lastfmKey + "&artist=" + array[i].artist_name + "&track=" + array[i].title + "&format=json";
    //var url = "http://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=a710fbf71d1c67c8786389160c3029e1&artist=" + array[i].artist_name + "&track=" + array[i].title;
    $.ajax({
  	  type: "GET",
      url: url,
      contentType: "application/json",
      success: function (data) {
        //console.log(data);
        
        if(data.error != undefined) {
          //console.log('data not valid');
          tempArray[tempArray.length] = {
            "artist": "unknown",
            "song": "unknown",
            "image": "assets/placeholder.png"
          }
        }
        else {
          //console.log(data);
          
          
          var input = JSON.stringify(data);
          //console.log(input);

          var jsonThis = input.replace(/#/g, "_");

          jsonThis = JSON.parse(jsonThis);

          /*console.log(jsonThis.track.album.image[3]._text);*/

          //console.log(jsonThis.track.name);

          tempArray[tempArray.length] = {
            "artist": jsonThis.track.artist.name,
            "song": jsonThis.track.name,
            "image": jsonThis.track.album.image[3]._text
          }
   
        }
    
        //console.log(tempArray[tempArray.length - 1].image);
        
        //console.log(jsonThis);
        j++;
        //console.log(data.track.album.image[3].);

        
      }
    });
  
  }
  
  setTimeout(function() {
    printBoxes(tempArray);
  }, 3000);
  
}

//http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=a710fbf71d1c67c8786389160c3029e1&artist=Cher&album=Believe&format=json

function moveTargetLeft() {
  
  /*var oldTarget = $('.active').attr('id');
  console.log(oldTarget);
  
  var oldTargetStart = oldTarget.substring(0, 1);
  var oldTargetEnd = oldTarget.substring(2, 3);
  
  if(oldTargetEnd <= 0) {
    return false;
  }
  else {
    
    var newActiveX = parseInt(oldTargetStart);
    newActiveX--;
    console.log(newActive + "_" + oldTargetStart);
    $('.active').removeClass('active');
    $('#' + newActive + "_" + oldTargetStart).addClass('active');
    //nowActive = oldTarget - 1 + "_" + oldTargetEnd;
  }*/
  
  var oldTarget = $('.active').attr('id');
  
  var oldTargetX = oldTarget.substring(0, 1);
  var oldTargetY = oldTarget.substring(2, 3);
  
  if(oldTargetX <= 0) {
    return false;
  }
  else {
    
    oldTargetX = parseInt(oldTargetX);
    oldTargetY = parseInt(oldTargetY);
    oldTargetX--;

    $('#' + oldTarget).removeClass('active');
    $('#' + oldTargetX + "_" + oldTargetY).addClass('active');

    nowActive = oldTargetX + "_" + oldTargetY;

    //$('#' + nowActive).scrollTo();
    
    $('html, body').animate({
      scrollLeft: $("#" + nowActive).offset().left - 100
    }, 500);
  }
  
  
}

function moveTargetRight() {
  var oldTarget = $('.active').attr('id');
  
  var oldTargetX = oldTarget.substring(0, 1);
  var oldTargetY = oldTarget.substring(2, 3);
  
  if(oldTargetX >= 4) {
    return false;
  }
  else {
    
    oldTargetX = parseInt(oldTargetX);
    oldTargetY = parseInt(oldTargetY);
    oldTargetX++;

    $('#' + oldTarget).removeClass('active');
    $('#' + oldTargetX + "_" + oldTargetY).addClass('active');

    nowActive = oldTargetX + "_" + oldTargetY;
    
    //$('#' + nowActive).scrollTo();
   
    $('html, body').animate({
      scrollLeft: $("#" + nowActive).offset().left - 100
    }, 500);
   
  }
  
}

function moveTargetUp() {
  var oldTarget = $('.active').attr('id');
  
  var oldTargetX = oldTarget.substring(0, 1);
  var oldTargetY = oldTarget.substring(2, 3);
  
  if(oldTargetY <= 0) {
    return false;
  }
  else {
    
    oldTargetX = parseInt(oldTargetX);
    oldTargetY = parseInt(oldTargetY);
    oldTargetY--;

    $('#' + oldTarget).removeClass('active');
    $('#' + oldTargetX + "_" + oldTargetY).addClass('active');
    
    nowActive = oldTargetX + "_" + oldTargetY;
    
    
    $('html, body').animate({
      scrollTop: $("#" + nowActive).offset().top
    }, 500);
    //$('#' + nowActive).scrollTo();
  }
  
}

function moveTargetDown() {
  var oldTarget = $('.active').attr('id');
  
  var oldTargetX = oldTarget.substring(0, 1);
  var oldTargetY = oldTarget.substring(2, 3);
  
  if(oldTargetY >= 3) {
    //console.log('STOP');
    return false;
  }
  else {
    
    oldTargetX = parseInt(oldTargetX);
    oldTargetY = parseInt(oldTargetY);
    oldTargetY++;

    $('#' + oldTarget).removeClass('active');
    $('#' + oldTargetX + "_" + oldTargetY).addClass('active');
    
    nowActive = oldTargetX + "_" + oldTargetY;
    
    //$('#' + nowActive).scrollTo();
    $('html, body').animate({
      scrollTop: $("#" + nowActive).offset().top
    }, 500);

  }
  
}