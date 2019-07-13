
var map=new Map();
var returnArray=[];
var fs=require('fs');
//<script type="text/javascript" src="https://cdn.firebase.com/js/client/2.3.2/firebase.js"></script>
var othersite = require('request');
var posl=["adj.", "adv.", "n.","v.", "prep.", "pron.","conj.", "tr.", "intr.", "vb.", "noun", "verb", "adjective","adverb","pronoun", "preposition"];
var posw=["noun", "verb", "adjective","adverb","pronoun", "preposition","conjunction"];
var pwl=posw.join(" ");
var posstr=posl.join(" ");

function cap(word){
   let first= word.charAt(0).toUpperCase();
   return first.concat(word.slice(1));
}

function capWordArray(wa){
  return wa.map(a=>cap(a));
}

const domStringToText=string=>string.replace(/(&nbsp;|<([^>]+)>)/ig, "_").split("_").map(b=>/[a-z]/g.test(b.toLowerCase().charAt(0))===true?b.toLowerCase():"").filter(a=>a===""||a===" "?false: true);

const isword=def=>def.toLowerCase().split(" ").filter(a=>posstr.includes(a)===true?false:true).filter(b=>/[^a-z.]/g.test(b)===true?false: true);

const durl=(word)=>`https://www.thefreedictionary.com/${word}`;

const stripHTML=(text)=>/<.+?>/g.test(text)?text.replace(/<.+?>/g,""):text;

function toNumberedListArray(htmltext){
    return stripHTML(htmltext).replace(/[1-9]?[0-9]\./g, "#SPLIT#_____").split("#SPLIT").map((a,i)=>true?a.replace("#_____", `(${i.toString()}).`):"").slice(1);
}

function splitAtTableRows(htmltext){
  let rows=htmltext.split("<tr>");
  rows.shift();
  return    stripHTML(rows.map(a=>a.replace(/<div class="Syn">.*?<a\s.*?>(.*?)<\/a>.*?<\/div>/g,' _SYN $1 SYN_ ').replace(/<div class="Rel">.*?<a\s.*?>(.*?)<\/a>.*?<\/div>/g,' _REL $1 REL_ ').replace(/<div class="Ant">.*?<a\s.*?>(.*?)<\/a>.*?<\/div>/g,'_ANT $1 ANT_ ')).join("__JOINER__"));
}

function getSynsFJTS(str){
    let ret=str.match(/\s_SYN(.*?)SYN_\s/g);
    return Array.isArray(ret)?ret.map(a=>a.replace(/\s_SYN(.*?)SYN_\s/g,'$1').trim()):ret;
}
function getAntsFJTS(str){
  let ret=str.match(/\s_ANT(.*?)ANT_\s/g);
 return Array.isArray(ret)?ret.map(a=>a.replace(/\s_ANT(.*?)ANT_\s/g,'$1').trim()):ret;
}
function getRelsFJTS(str){
  let ret=str.match(/\s_REL(.*?)REL_\s/g);
 return Array.isArray(ret)?ret.map(a=>a.replace(/\s_REL(.*?)REL_\s/g,'$1').trim()):ret;
}


function posTablePattern(str, word){
  var s=`\\w*?\\.${word}`;
  var regex=new RegExp(s,'g');
  var midval=str.match(regex);
  var pos= midval.filter(a=>!/^[0-9]/.test(a)).map(b=>true?b.toLowerCase().slice(0,Math.floor(b.indexOf(".")-1)):b);
  return pos;
}
function getPartOfSpeechFromTableText(text, word){
  return Array.isArray(text)?posTablePattern(text.join("__JOINER__ "), word):"";
}
function regexOrsFromArray(array){
  let retval=array.reduce((pre,a,i)=>{
      let toadd=i===0?`(${a}|`:i!==Math.floor(array.length-1)?`${a}|`:`${a})`;
      pre=pre.concat(toadd);
      return pre;
  },``);
  let holder =new RegExp(retval,"g");
  return holder;
}
function splitIntoPOSArrays(pos,stringtext){
  var splits=regexOrsFromArray(pos);
  let defarr= stringtext.split(splits);
    defarr.shift();
   let retArr =defarr.filter(a=>!splits.test(a))
    return retArr;
}


function defObj(posdef,pos, word){
 return posdef.map(a=>{
      let eg=a.match(/".*?"/g);
      let d=a.match(/\-.*?;/);
      let syn=a!=undefined?a.replace(/-.*?;/,"").replace(/".*?"/g,"").replace(/;/g,"").replace("_SYN_","").split(/(,|-|\s\s+?)/g).map(b=>true?b.trim():b.trim()).filter(c=>/(-|,)/g.test(c)|c===""?false:true):(console.log("wrd",a),a);
      let index= Array.isArray(syn)?syn.shift():null;
      let nos= index!=undefined?Math.floor(index.split(".")[0]-0):index;
      let obj={
        "word":word,
        "pos":pos,
        "nos":nos,
        "def":Array.isArray(d)?d[0].replace("-","").trim():d,
        "ant":"antonyms",
        "syn":syn,
        "examples":Array.isArray(eg)?eg.length===1?eg[0]:eg:eg,
        
      };
     // console.log(obj);
      return obj;
    });
}

function mapOnPOS(pos,text,word){
  // console.log(pos);
  var pos= !Array.isArray(pos)?["noun","verb"]:pos;
  return splitIntoPOSArrays(capWordArray(pos),text)
  .map((a,i)=>{
            let  obj={
              "word":word,
              "pos":pos[i],
              "syn":getSynsFJTS(a), 
              "sim":getRelsFJTS(a),
              "ant":getAntsFJTS(a),
            };
          //  console.log(obj,"________KJK");
            return obj; 
  });
}


var getDefinition=function(word,text){
     let defs= text.split('<div id="Definition">')[1].split('<div id="Thesaurus">')[0].split('<section data-src').filter((a,i)=>/(="rHouse">)|(="hm">)/g.test(a)?(console.log(i, "true"),true):(console.log(i,"false"),false));
     //.split('<div class="pseg">');
    // console.log(defs);
     //defs.shift();
     var pos="pos";
    return defs.map(a=>{
            let b=a.split(`</i>`,1);
            let p=stripHTML(b[0]);
            let c=b[0].concat(`</i>`);
            let d=JSON.stringify(stripHTML(a.replace(c,"")).replace(/[1-9]?[0-9]\./g, "#SPLIT#_____").split("#SPLIT").map((a,i)=>true?a.replace("#_____", `(${i.toString()}).`):"").slice(1));
            pos=p!==""?p:pos;
            
       let obj={"pos":pos,"def":d};
       //console.log(obj)
        return obj;
      });
      } 
var getAlphaClose=function(word, text){
    var text= text.slice(text.indexOf(`<strong class="title">Dictionary browser</strong>`)).replace(`<strong class="title">Dictionary browser</strong>`,"");
        text=text.slice(text.indexOf(`<ul>`),text.indexOf(`</ul>`)).concat(`</ul>`);
        text=domStringToText(text);
        let indexer=text.indexOf(word);
        return text.slice(Math.floor(indexer-3), Math.floor(indexer+3));
    }
var getPosArrayOfHc_thes=function(str){
  let pos=str.match(/<div><i>.*?<\/i>/g);
  return Array.isArray(pos)?pos.map(a=>a.replace(/<div><i>(.*?)<\/i>/g, '$1')):pos;

}
var splitHc_thesOnPOS=function(str){
 let posarr= str.split(/<div><i>.*?<\/i>/g);
 let waste= Array.isArray(posarr)?posarr.shift():posarr;
 return posarr;
}
var handleHc_thes=function(str){
  var row=getPosArrayOfHc_thes(str);
  Array.isArray(row)?stripHTML(row.map(a=>{

    let syn=a.match(/<span class="Syn">.*?<\/span>/g);
    Array.isArray(syn)?syn.map(b=>b.replace(/.*?<a\s.*?>(.*?)<\/a>/g,' _SYN $1 SYN_ '):syn;
    let ant=  replace(/<div class="Rel">.*?<a\s.*?>(.*?)<\/a>.*?<\/div>/g,' _REL $1 REL_ ').replace(/<div class="Ant">.*?<a\s.*?>(.*?)<\/a>.*?<\/div>/g,'_ANT $1 ANT_ ')).join("__JOINER__")):"__JOINER__";
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
var synMap=function(word,text){
    var text1=text.slice(text.indexOf('<section data-src="hm"'),text.indexOf('<div id="Translations"'));
    var text2=text1.slice(text1.indexOf('<div id="Thesaurus"')).replace(/\n/g,"").replace(/\r/g, "");
    var text3=text2.match(/((<section data-src="hm_thes">.*?<\/section>)|(<section data-src="hc_thes"(.*?|.*?\n)<\/section>)|(<section data-src="wn"(.*?|.*?\n)<\/section>))/gi);
      var bb= text3.map(a=>/data-src="wn"/gi.test(a)===false?toNumberedListArray(a):splitAtTableRows(a));
   var cc=getPartOfSpeechFromTableText(bb[0],word);
   console.log(cc, bb[1],bb[2],"__kjkj__");
   var dd=mapOnPOS(cc,bb[0],word);
    return dd;

}
var htmlAsTextArchive=[];
var entryMaker=function(html,word){
    var entry={"word":word!==undefined?word:"ambivalent","pos":"","def":"","syn":"","ant":"","tensor":""};
      //console.log(html);
    var text= html.toString();
    synMap(entry.word,text);
   
    let defs=getDefinition(word,text);
    entry.def=JSON.parse(defs[1].def).map(a=>/[a-b]\./g.test(a)===true?"":/\./g.test(a)===true?a.replace(/\./g,""):a).filter(b=>b===""||b===" "?false: true);
    entry.word=word;
    entry.syn=getSynonyms(word, text);
    entry.ant=getAntonyms(word,text);
    entry.pos=defs.pos;
    entry.rel=getAlphaClose(entry.word, text);
    entry.def2=JSON.parse(defs[0].def);

        map.set(word, entry);
      // console.log(map);
    return entry;
   }
function* getEntry(array){
    var i=0;
    while(i<array.length){
        var word=array[i],x;
        i++;
        yield othersite(durl(word),(error, response, html)=>{
              entryMaker(html,word);
            //  console.log(word);
              if(i===array.length)
              {
                    let entries=Array.from(map.values());
                   // console.log(entries);
                    fs.writeFile('output.json', JSON.stringify(entries), function(err){
                            console.log('File successfully written! - Check your project directory for the output.json file');
                        }
                    );
              }
            });
    }    
    return; 
}
let bn=durl("force");
console.log(bn,"is value?");
var returnValue=othersite(bn,(error, response, html)=>{
  //console.log(html, error, response, "early");
        let p=entryMaker(html,"force");
        console.log(p);
        var j=0,count=p.syn.length;
        var func=getEntry(p.syn);
        var pp=setInterval(()=>{
            j===count?clearInterval(pp):j++;
           let ppp= func.next().value;
           //console.log(ppp,"infunc");
        },30000); 
    });
//console.log(returnValue,"here bitch", this)
 


