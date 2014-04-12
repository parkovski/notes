var fs = require('fs');
var request = require('request');

var etherpadApiKey;
var etherpadUrl;

if (process.env.ETHERPAD_DIR) {
  try {
    etherpadApiKey = fs.readFileSync(process.env.ETHERPAD_DIR + '/APIKEY.txt');
  } catch (e) {
    console.warn('Couldn\'t read file specified in ETHERPAD_DIR.');
  }
} else if (process.env.ETHERPAD_APIKEY) {
  etherpadApiKey = process.env.ETHERPAD_APIKEY;
}

if (!etherpadApiKey) {
  console.warn('Etherpad API key not found; some features may not work.');
}

if (process.env.PAD_URL) {
  etherpadUrl = process.env.PAD_URL;
} else {
  console.warn('Etherpad URL not set; defaulting to http://pad.uanotes.com/');
  etherpadUrl = 'http://pad.uanotes.com';
}

exports.getEtherpadUrl = function(id) {
  return etherpadUrl + '/p/' + id;
};

// callback = function(err, url)
exports.getReadOnlyUrl = function(id, callback) {
  if (!etherpadApiKey) {
    return callback('Can\'t contact Etherpad because no API key is set.');
  }
  
  var requestUrl = etherpadUrl
    + '/api/1/getReadOnlyID?padID=' + id
    + '&apikey=' + etherpadApiKey;
    
  request(requestUrl, function(err, response, body) {
    if (err) return callback(err);
    
    var readOnlyId;
    try {
      readOnlyId = JSON.parse(body).data.readOnlyID;
    } catch (e) {
    }
    
    if (!readOnlyId) {
      callback('problems were problems dawg');
    } else {
      callback(null, exports.getEtherpadUrl(readOnlyId));
    }
  });
};