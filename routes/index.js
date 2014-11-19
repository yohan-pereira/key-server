var express = require('express');
var router = express.Router();

/* GET home page. */

var keymap = {};

function generateKey() {
  var key = Math.floor(Math.random() * 10000);
  keymap[key] = {blocked: null, //null means unblocked , time stamp means blocked since that time.
		 created: new Date}; //created/keep-alive date
}

function getAvailable() {
  var keys = Object.keys(keymap);
  return keys.filter(function (key) {

    var state = keymap[key];
    
    // unblock keys if they are blocked longer than 60 secs.
    if(state.blocked) {
      var blockedfor = new Date - state.blocked;
      if(blockedfor > (60 * 1000)) {
	setBlocked(key, false);
      }
    }

    var alivefor = new Date - state.created;
    return ((!state.blocked) && (alivefor < (1000 * 60 * 5)));
  }) [0];
}


function setBlocked(key, block) {
  if(keymap[key]) 
    keymap[key].blocked = block ? new Date : null;
}

function deleteKey(key) {
  if (keymap[key]) 
    delete keymap[key];
}

function keepAlive(key) {
  if (keymap[key]) 
    keymap[key].created = new Date;
}


router.get('/', function(req, res) {
  //res.render('index', { title: 'Express' });
  res.send('Hi');
});

router.post('/generate-key', function (req, res) {
  generateKey();
  res.status(200).end();
});

router.post('/get-key', function (req, res) {
  var key = getAvailable();
  if (key) {
    setBlocked(key, true);
    res.send(key).status(200).end();
  } else {
    res.status(404).end();
  }
});

router.post('/unblock-key', function(req, res) {
  var key = parseInt(req.param("key"));
  setBlocked(key, false);
  res.status(200).end();
});

router.post('/delete-key', function(req, res) {
  var key = parseInt(req.param("key"));
  deleteKey(key);
  res.status(200).end();
});

router.post('/keep-alive', function(req, res) {
  var key = parseInt(req.param("key"));
  keepAlive(key);
  res.status(200).end();
});




module.exports = router;
