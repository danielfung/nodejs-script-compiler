var fs   = require('fs'),
    handlebars = require('handlebars');






/* ---------------- EDIT HERE ------------------ */
/* --------------------------------------------- */
var outputFolder = 'output';
var wrapName = 'person';
var fileName = 'crmsUpdate';
var templateName = 'updatePersonCRMS';
var breakBy = 1000;
/* --------------------------------------------- */







var original = breakBy;
var rowCount = 0;
var count_createdFiles = 0;
var prefix = 0;

checkDirectorySync("./"+outputFolder);
parseCSV();
console.log("Building script...");

function parseCSV(){
  fs.readFile('./data/'+fileName+'.csv', function read(err, data) {
    if (err) {
      throw err;
    }
    var headerLine;
    var content = data.toString();
    var lengthofCSV = content.split("\r");
    rowCount = lengthofCSV.length;
    get_line('./data/'+fileName+'.csv', 0, function(err, header_line){
      headerLine = header_line;
    });
    if((original == 0) || (original >= rowCount)){
      for(var i = 1; i < rowCount-1; i++){
        get_line('./data/'+fileName+'.csv', i, function(err, line){
          if(i != breakBy)
          createJSONfile(headerLine, line);
          if(i == breakBy){
            createJSONfile(headerLine, line);
            i = breakBy;
            breakBy += breakBy;
          }
        });
      }
    }
    else{
      for(var i = 1; (i < 1+breakBy) && (i < rowCount-1); i++){
        get_line('./data/'+fileName+'.csv', i, function(err, line){
          if(i != breakBy)
          createJSONfile(headerLine, line);
          if(i == breakBy){
            createJSONfile(headerLine, line);
            i = breakBy;
            breakBy += breakBy;
          }
        });
      }
    }
  });
}

function get_line(filename, line_no, callback) {
  var data = fs.readFileSync(filename, {encoding:'utf8'});
  var lines = data.split("\n");
  if(+line_no > lines.length){
    throw new Error('File end reached without finding line');
  }
  callback(null, lines[+line_no]);
}

function createJSONfile(hLine, data){
  var string = csvJSON(hLine.toString(), data.toString());
  string = string.replace(/(?:\\[rn]|[\r\n]+)+/g, "");
  fs.writeFileSync("./"+outputFolder+"/jsonFile.json", '{'+'"'+wrapName+'"'+':'+string+'}', {encoding:'utf8'});
  var JSONdata = fs.readFileSync("./"+outputFolder+'/jsonFile.json', {encoding:'utf8'});
  var sourceTemplate = fs.readFileSync('./data/'+templateName+'.tpl', {encoding:'utf8'});
  var parsedJSON = JSON.parse(JSONdata);
  var readTemplate = handlebars.compile(sourceTemplate);
  var finishedTemplate = readTemplate(parsedJSON);
  //fs.writeFileSync('./'+outputFolder+'/'+timestamp+'.txt', finishedTemplate, {encoding:'utf8'});
  var timestamp = getDateTime();
  if(mod(count_createdFiles, original) == 0){
    count_createdFiles++;
    prefix++;
    timestamp = getDateTime();
    fs.appendFileSync('./'+outputFolder+'/'+prefix+timestamp+'.txt', finishedTemplate, {encoding:'utf8'});
  }
  else{
    count_createdFiles++;
    fs.appendFileSync('./'+outputFolder+'/'+prefix+timestamp+'.txt', finishedTemplate, {encoding:'utf8'});
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function csvJSON(headLine, csv){
  var result = [];
  var headers = headLine.split(",");
  var obj = {};
  var currentline=csv.split(",");
  for(var j = 0; j < headers.length; j++){
    obj[headers[j]] = currentline[j];
  }
  result.push(obj);
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
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  month = (month < 10 ? "0" : "") + month;
  var day  = date.getDate();
  day = (day < 10 ? "0" : "") + day;
  return year + month + day
}
