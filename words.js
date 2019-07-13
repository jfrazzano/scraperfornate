//TODO LINK THIS TO YOUR FIREBASE AND LET THE FREAKING THING RUN
var map=new Map();
var returnArray=[];
// const fbi = require('./firebase_2_3');
const keys2=require('./dictionarykeys');
var fs=require('fs');
var othersite = require('request');
var keys=[];
var sparent="never";

var tcom = require('thesaurus-com');
 
map.set("never",Object.assign({'word':'never'} ,
tcom.search('never')));
console.log(map);

// var Firebase = require("firebase");

// var ref = new Firebase("https://focusedstaging1.firebaseio.com/dictionary/");
// var dictvals;

// var ref = new Firebase("https://focusedstaging1.firebaseio.com/dictionary/");
// var dictvals;
//     ref.on("value", (snapshot)=>{
//     console.log(snapshot);
//       dictvals = snapshot.val();
//     console.log(dictvals);
//    });
// // })
//     console.log(Firebase,"look here");

//<script type="text/javascript" src="https://cdn.firebase.com/js/client/2.3.2/firebase.js"></script>

var posl=["adj.", "adv.", "n.","v.", "prep.","intr.", "pron.","conj.", "tr.", "intr."];
var posstr=posl.join(" ");
const domStringToText=string=>string.replace(/(&nbsp;|<([^>]+)>)/ig, "_").split("_").map(b=>/[a-z]/g.test(b.toLowerCase().charAt(0))===true?b.toLowerCase():"").filter(a=>a===""||a===" "?false: true);
const isword=def=>def.toLowerCase().split(" ").filter(a=>posstr.includes(a)===true?false:true).filter(b=>/[^a-z.]/g.test(b)===true?false: true);
var mydic=`https://focusedstaging1.firebaseio.com/dictionary/`;
var ud=`https://www.thefreedictionary.com/`;
var durl=(word,url)=>`${url==undefined?ud:url}${word}`;

const stripHTML=(text)=>/<.+?>/g.test(text)?text.replace(/<.+?>/g,""):text;

var getDefinition=function(word,text){
      let stdtxt=`English dictionary definition of ${word}.`;
      let offset=stdtxt.split("").length;
      return isword(text.slice(Math.floor(text.indexOf(stdtxt)+offset),text.indexOf(`.">`)));
      } 
var getAlphaClose=function(word, text){
    var text= text.slice(text.indexOf(`<strong class="title">Dictionary browser</strong>`)).replace(`<strong class="title">Dictionary browser</strong>`,"");
        text=text.slice(text.indexOf(`<ul>`),text.indexOf(`</ul>`)).concat(`</ul>`);
        text=domStringToText(text);
        let indexer=text.indexOf(word);
        return text.slice(Math.floor(indexer-3), Math.floor(indexer+3));
    }
var getSynonyms=function(word, text){
          var text=text.slice(text.indexOf(`<span class="Syn">`)).replace(`<span class="Syn">`);
            return text.slice(text.indexOf(`<span class="Syn">`),text.indexOf(`<span class="illustration">`)).replace(`<span class="Syn">`,"").replace("</span>","").replace(",","").split(`</a>`).map(a=>{return a.slice(Math.floor(1+a.indexOf(">")));}).filter(b=>b!==" "?true:false).map(c=>true?stripHTML(c):c);
            }
var getAntonyms=function(word,text){
    var text =text.replace(`<span class="Ant">`,"");
    text=text.slice(text.indexOf(`<span class="Ant">`)).replace(`<span class="Ant">`,"").slice(0,text.indexOf(`</span>`));
   
    return text.slice(0,text.indexOf(`</span>`)).replace(",","").split(`</a>`).map(a=>{return a.slice(Math.floor(1+a.indexOf(">")));}).filter(b=>b!==" "&&b!==""?true:false).map(c=>true?stripHTML(c):c);
    }
var entryMaker=function(html,word){
    var entry={"word":word!==undefined?word:"ambivalent","pos":"","def":"","syn":"","ant":"","tensor":""};
    var text= html.toString();
    entry.def=getDefinition(word,text).join(" ").split(".").map(a=>a?a.concat("."):a).filter(b=>b===""||b===" "?false: true);
    entry.word=word;
    entry.syn=getSynonyms(word, text);
    entry.ant=getAntonyms(word,text);
    entry.pos=posl.filter(a=>entry.def.includes(a)===true?true:false);
    entry.rel=getAlphaClose(entry.word, text);
    entry.tocheck=getDefinition(word,text).map(a=>/[a-b]\./g.test(a)===true?"":/\./g.test(a)===true?a.replace(/\./g,""):a).filter(b=>b===""||b===" "?false: true);
        map.set(word, entry);
        console.log(word, map);
    return entry;
   }
function* getEntry(array){
    var i=0;
    while(i<array.length){
        var word=array[i],x;
        console.log(word);
        word=/\(.+?\).*?\,/g.test(word)?word.replace(/\(.+?\).*?\,/g,"").trim():word.trim();
        i++;
        if(/\s/g.test(word)===true){
          var ent={'word': word,  'def': "see idiom" , 'syn': "see parent", 'ant': 'see parent','pos': 'see parent','rel':"seeparent"};
          map.set(word, ent);

          if(i===array.length)
              {
                    let entries=Array.from(map.values());
                    console.log(entries);
                    fs.writeFile(`output_${new Date().getTime().toString()}_.json`, JSON.stringify(entries), function(err){
                            console.log('File successfully written! - Check your project directory for the output.json file');
                        }
                    );
              }
          }
        else{
        	var what=mydic?othersite(durl(word, mydic),(e,r,h)=>{
        		console.log(h.toString().slice(0,1000), "in the firebase");
        		return r;}):mydic;
        	console.log("what the fuck,", what);
          yield othersite(durl(word),(error, response, html)=>{
              entryMaker(html,word);
              if(i===array.length)
              {
                    let entries=Array.from(map.values());
                    console.log(entries);
                    fs.writeFile(`output_${new Date().getTime().toString()}_.json`, JSON.stringify(entries), function(err){
                            console.log('File successfully written! - Check your project directory for the output.json file');
                        }
                    );
              }

            });
        }
        console.log(word);
    }    
    return; 
}
sparent=sparent.length<3?"aberrant":sparent;
console.log("start", sparent)
var returnValue=othersite(durl(sparent),(error, response, html)=>{
        let p=entryMaker(html,sparent);
        var j=0,count=p.syn.length;
        var func=getEntry(p.syn);
        var pp=setInterval(()=>{
            j===count?clearInterval(pp):j++;
           let ppp= func.next().value;
           //console.log(ppp,"infunc");
        },30000); 
    });
*/