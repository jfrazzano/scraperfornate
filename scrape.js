var http = require('http');
var fs = require('fs');
var path = require('path');
var request = require('request');

var text;
var t2; 

http.createServer(function (request_, response_) {

function Scraper(olddictionary,words){
        this.durl=(word)=>`https://www.thefreedictionary.com/${word}`;
        this.turl=(word)=>`https://www.freethesaurus.com/${word}`;
        this.def=this.defHTML("ambivalent");
        this.syn=this.synHTML("ambivalent");
        console.log(this);
        //this.entries=new Set(olddictionary);
}
Scraper.prototype.defHTML=function(word){
    let url=this.durl(word);        
   let t= request(url,function(error, response, html){
            text= html.toString();
            text='<p>'.concat(text.slice(text.indexOf("<title"),text.indexOf("<base"))).replace(`- definition of ${word} by The Free Dictionary`,"");
            let textArr= text.replace("title","strong").replace("title","strong").split("<meta");
            if(textArr!==undefined&&textArr[1]!==undefined){
                let offset= textArr[1]!==undefined?Math.floor(`English dictionary definition of ${word}`.split("").length + textArr[1].indexOf(`English dictionary definition of ${word}`)):0; 
                textArr[1]= textArr[1].slice(offset).replace('">','</p>');
                text=textArr.join("");
            }
            return text;
        });
    return text;
}
Scraper.prototype.synHTML=function(word){
    let url=this.turl(word);      
    request(url, 
        function(error, response, html){
            t2= html.toString();
            t2='<p>'.concat(t2.slice(t2.indexOf("<title"),t2.indexOf("<base")).toLowerCase().replace(`${word} synonyms, ${word} antonyms - freethesaurus.com`,"Synonyms: "));
            let textArr= t2.replace("title","i").replace("title","i").split("<meta");
            if(textArr!==undefined&&textArr[1]!==undefined){
                let offset= `${word}:`.split("").length + textArr[1].indexOf(`${word}:`); 
                textArr[1]= textArr[1].slice(offset).replace('">','</p>');
                t2=textArr.join("");
                t2=t2.slice(0,t2.indexOf("...."));
            }
            return t2;
        });
    return t2;
}


var sc=new Scraper();
var content=sc.defHTML("ambivalent");
if (content!==undefined){
    let holder=sc.synHTML("ambivalent");
    content=content.concat(holder);}
//console.log(content, "content");
console.log(sc);
//console.log("request", request_.url)
   // Set the response HTTP header with HTTP status and Content type
   response_.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
   response_.end(content);
}).listen(3000);

//console.log('Server running at http://127.0.0.1:3000/');


/*
http.createServer(function (request, response) {
    console.log('request:',request.url);

    var filePath = '.' + request.url;
    if (filePath == './') {
        filePath = './index.html';
    }

    var extname = String(path.extname(filePath)).toLowerCase();
    var contentType = 'text/html';
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(8125);
console.log('Server running at http://127.0.0.1:8125/');
*/