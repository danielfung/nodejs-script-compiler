var fs = require("fs");
var handlebars = require('handlebars');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var fileName = 'name-csv-here';
var templateName = 'name-tpl-here';
var outputFolder = '';
var wrapName = '';

rl.question('Name output folder: ', (outFolder) => {
  outputFolder = outFolder;
  rl.question('Name wrapper: ', (answer) => {
    wrapName = answer;
    checkDirectorySync("./"+outputFolder);
    fs.readFile('./'+'data/'+fileName+'.csv', function (err, data) {
      if (err){
        console.log(err.stack);
        return;
      }
      createJSONfile(data);
      var timestamp = getDateTime();
      createCompiledScript(timestamp);
      console.log("---Complete---");
    });
    rl.close();
  })});

  function createJSONfile(data){
    console.log("Converting CSV to JSON");
    var jsonLocation = "./"+outputFolder+"/jsonFile.json";
    var string = csvJSON(data.toString());
    string = string.replace(/(?:\\[rn]|[\r\n]+)+/g, "");
    fs.writeFileSync(jsonLocation, '{'+'"'+wrapName+'"'+':'+string+'}', {encoding:'utf8'});
    console.log("Finished CSV to JSON");
  }

  function csvJSON(csv){
    var lines = csv.split("\n");
    var result = [];
    var headers = lines[0].split(",");
    for(var i=1; i < lines.length; i++){
      var obj = {};
      var currentline=lines[i].split(",");
      for(var j = 0; j < headers.length; j++){
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return JSON.stringify(result);
  }

  function checkDirectorySync(directory) {
    try {
      fs.statSync(directory);
    } catch(e) {
      fs.mkdirSync(directory);
    }
  }

  function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    return year + month + day + hour + min + sec;
  }

  function createCompiledScript(datetime){
    var timestamp = datetime;
    console.log('Making template');
    var JSONdata = fs.readFileSync("./"+outputFolder+'/jsonFile.json', {encoding:'utf8'});
    var sourceTemplate = fs.readFileSync('./data/srctemplate.tpl', {encoding:'utf8'});
    var parsedJSON = JSON.parse(JSONdata);
    var readTemplate = handlebars.compile(sourceTemplate);
    var finishedTemplate = readTemplate(parsedJSON);
    fs.writeFileSync('./'+outputFolder+'/'+timestamp+'.txt', finishedTemplate, {encoding:'utf8'});
  }
