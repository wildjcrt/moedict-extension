function selectCallback(selectionParentElement, callback) {
  var content, word;
  var keyMap = { h: '"heteronyms"', b: '"bopomofo"', p: '"pinyin"', d: '"definitions"', c: '"stroke_count"', n: '"non_radical_stroke_count"', f: '"def"', t: '"title"', r: '"radical"', e: '"example"', l: '"link"', s: '"synonyms"', a: '"antonyms"', q: '"quote"', _: '"id"', '=': '"audio_id"', E: '"english"', T: '"trs"', A: '"alt"', V: '"vernacular"', C: '"combined"', D: '"dialects"', S: '"specific_to"' };
  word = b2g(selectionParentElement.toString());
  $.ajax({
    url: "https://www.moedict.tw/a/" + word + ".json",
    dataType: 'text',
    success: function(result) {
      result = result.replace(/"([hbpdcnftrelsaqETAVCDS_=])":/g, function(arg$, k){
        return keyMap[k] + ':';
      });
      result = result.replace(/`([^~]+)~/g, function(arg$, word){
        return "<a target='_blank' href='https://www.moedict.tw/" + encodeURIComponent(word) + "'>" + word + "</a>";
      });
      content = renderResult($.parseJSON(result));
      createDiv(content);
      if (typeof(callback) === 'function') {
        callback();
      };
    },
    error: function(result) {
      return null;
    }
  });
};

$(document).on('mouseup', function() {
  var selection = window.getSelection();
  if (selection.rangeCount > 0) {
    var range = selection.getRangeAt(0);
    if (range.toString()) {
      thisY = window.pageYOffset + event.clientY + 10;
      thisX = window.pageXOffset + event.clientX + 10;
      selectCallback(range, function(){
        $('#moedict-extension').css('position', 'absolute');
        $('#moedict-extension').css('top', thisY);
        $('#moedict-extension').css('left', thisX);
        $('#moedict-extension').css('z-index', 9999);
      });
    }
  }
});

$(document).on('mouseup', '#moedict-extension', function(e){
  e.stopPropagation();
});

$(document).on('click', function(){
  $('#moedict-extension').hide();
});

$(document).on('click', '#moedict-extension', function(e){
  e.stopPropagation();
});

var LANG = 'a', split$ = ''.split, replace$ = ''.replace, join$ = [].join, slice$ = [].slice;
function canPlayOgg () { return false }
function canPlayMp3 () { return false }
function createDiv(content) {
  if ($('#moedict-extension').length === 0) {
    $('<div id="moedict-extension" class="ui-tooltip prefer-pinyin-false"></div>').appendTo('body');
  }
  $('#moedict-extension').show().html(content);
};

// rename render => renderResult
function renderResult(json){
  var title, english, heteronyms, radical, translation, nrsCount, sCount, py, charHtml, result;
  title = json.title, english = json.english, heteronyms = json.heteronyms, radical = json.radical, translation = json.translation, nrsCount = json.non_radical_stroke_count, sCount = json.stroke_count, py = json.pinyin;
  title = title.replace(/<[^>]*>/g, '');
  charHtml = radical ? "<div class='radical'><span class='glyph'>" + renderRadical(replace$.call(radical, /<\/?a[^>]*>/g, '')) + "</span><span class='count'><span class='sym'>+</span>" + nrsCount + "</span><span class='count'> = " + sCount + "</span>&nbsp;<span class='iconic-circle stroke icon-pencil' title='筆順動畫'></span></div>" : "<div class='radical'><span class='iconic-circle stroke icon-pencil' title='筆順動畫'></span></div>";
  result = ls(heteronyms, function(arg$){
    var id, audio_id, ref$, bopomofo, pinyin, trs, definitions, antonyms, synonyms, variants, specific_to, alt, cnSpecific, basename, mp3;
    id = arg$.id, audio_id = (ref$ = arg$.audio_id) != null ? ref$ : id, bopomofo = arg$.bopomofo, pinyin = (ref$ = arg$.pinyin) != null ? ref$ : py, trs = (ref$ = arg$.trs) != null ? ref$ : '', definitions = (ref$ = arg$.definitions) != null
      ? ref$
      : [], antonyms = arg$.antonyms, synonyms = arg$.synonyms, variants = arg$.variants, specific_to = arg$.specific_to, alt = arg$.alt;
    pinyin == null && (pinyin = trs);
    if (LANG !== 'c') {
      pinyin = replace$.call(pinyin, /<[^>]*>/g, '').replace(/（.*）/, '');
    }
    if (audio_id && LANG === 'h') {
      pinyin = pinyin.replace(/(.)\u20DE/g, function(_, $1){
        var variant, mp3;
        variant = " 四海大平安".indexOf($1);
        mp3 = http("h.moedict.tw/" + variant + "-" + audio_id + ".ogg");
        if (mp3 && !canPlayOgg()) {
          mp3 = mp3.replace(/ogg$/, 'mp3');
        }
        return "</span><span class=\"audioBlock\"><div onclick='window.playAudio(this, \"" + mp3 + "\")' class='icon-play playAudio part-of-speech'>" + $1 + "</div>";
      });
    }
    bopomofo == null && (bopomofo = trs2bpmf(pinyin + ""));
    bopomofo = bopomofo.replace(/ /g, '\u3000').replace(/([ˇˊˋ])\u3000/g, '$1 ');
    if (LANG !== 'c') {
      bopomofo = replace$.call(bopomofo, /<[^>]*>/g, '');
    }
    pinyin = pinyin.replace(/ɡ/g, 'g');
    cnSpecific = '';
    if (/陸/.exec(bopomofo) && !/<br>/.test(bopomofo)) {
      cnSpecific = 'cn';
    }
    if (!/</.test(title)) {
      title = "<div class='stroke' title='筆順動畫'>" + title + "</div>";
    }
    return "    <!-- STAR -->\n    " + charHtml + "\n    <h1 class='title' data-title=\"" + (replace$.call(h(title), /<[^>]+>/g, '')) + "\">" + h(title) + (audio_id && (canPlayOgg() || canPlayMp3()) && (LANG === 't' && !(20000 < audio_id && audio_id < 50000)
      ? (basename = replace$.call(100000 + Number(audio_id), /^1/, ''), mp3 = http("t.moedict.tw/" + basename + ".ogg"))
      : LANG === 'a' && (mp3 = http("a.moedict.tw/" + audio_id + ".ogg")), mp3 && !canPlayOgg() && (mp3 = mp3.replace(/ogg$/, 'mp3'))), mp3 ? "<i class='icon-play playAudio' onclick='window.playAudio(this, \"" + mp3 + "\")'></i>" : '') + (english ? "<span class='english'>(" + english + ")</span>" : '') + (specific_to ? "<span class='specific_to'>" + specific_to + "</span>" : '') + "</h1>" + (bopomofo ? "<div class='bopomofo " + cnSpecific + "'>" + (pinyin ? "<span class='pinyin'>" + h(pinyin) + "</span>" : '') + "<span class='bpmf'>" + h(bopomofo) + "</span>" + (alt != null ? "<div class=\"cn\">\n  <span class='xref part-of-speech'>简</span>\n  <span class='xref'>" + (replace$.call(alt, /<[^>]*>/g, '')) + "</span>\n</div>" : '') + "</div>" : '') + "<div class=\"entry\">\n    " + ls(groupBy('type', definitions.slice()), function(defs){
      var ref$, t;
      return "<div class=\"entry-item\">\n" + ((ref$ = defs[0]) != null && ref$.type ? (function(){
        var i$, ref$, len$, results$ = [];
        for (i$ = 0, len$ = (ref$ = split$.call(defs[0].type, ',')).length; i$ < len$; ++i$) {
          t = ref$[i$];
          results$.push("<span class='part-of-speech'>" + t + "</span>");
        }
        return results$;
      }()).join('&nbsp;') : '') + "\n<ol>\n" + ls(defs, function(arg$){
        var type, def, quote, ref$, example, link, antonyms, synonyms;
        type = arg$.type, def = arg$.def, quote = (ref$ = arg$.quote) != null
          ? ref$
          : [], example = (ref$ = arg$.example) != null
          ? ref$
          : [], link = (ref$ = arg$.link) != null
          ? ref$
          : [], antonyms = arg$.antonyms, synonyms = arg$.synonyms;
        return "<li><p class='definition'>\n    <span class=\"def\">" + h(expandDef(def)).replace(/([：。」])([\u278A-\u2793\u24eb-\u24f4])/g, '$1</span><span class="def">$2') + "</span>\n    " + ls(example, function(it){
          return "<span class='example'>" + h(it) + "</span></span>";
        }) + "\n    " + ls(quote, function(it){
          return "<span class='quote'>" + h(it) + "</span>";
        }) + "\n    " + ls(link, function(it){
          return "<span class='link'>" + h(it) + "</span>";
        }) + "\n    " + (synonyms ? "<span class='synonyms'><span class='part-of-speech'>似</span> " + h((replace$.call(synonyms, /^,/, '')).replace(/,/g, '、')) + "</span>" : '') + "\n    " + (antonyms ? "<span class='antonyms'><span class='part-of-speech'>反</span> " + h((replace$.call(antonyms, /^,/, '')).replace(/,/g, '、')) + "</span>" : '') + "\n</p></li>";
      }) + "</ol></div>";
    }) + "\n    " + (synonyms ? "<span class='synonyms'><span class='part-of-speech'>似</span> " + h((replace$.call(synonyms, /^,/, '')).replace(/,/g, '、')) + "</span>" : '') + "\n    " + (antonyms ? "<span class='antonyms'><span class='part-of-speech'>反</span> " + h((replace$.call(antonyms, /^,/, '')).replace(/,/g, '、')) + "</span>" : '') + "\n    " + (variants ? "<span class='variants'><span class='part-of-speech'>異</span> " + h(variants.replace(/,/g, '、')) + "</span>" : '') + "\n    </div>";
  });
  return result + "" + (translation ? "<div class='xrefs'><span class='translation'>" + ('English' in translation ? "<div class='xref-line'><span class='fw_lang'>英</span><span class='fw_def'>" + ((join$.call(translation.English, ', ')).replace(/, CL:.*/g, '').replace(/\|(?:<\/?a[^>*]>|[^[,.(])+/g, '')) + "</span></div>" : '') + "" + ('francais' in translation ? "<div class='xref-line'><span class='fw_lang'>法</span><span class='fw_def'>" + join$.call(translation.francais, ', ') + "</span></div>" : '') + "" + ('Deutsch' in translation ? "<div class='xref-line'><span class='fw_lang'>德</span><span class='fw_def'>" + join$.call(translation.Deutsch, ', ') + "</span></div>" : '') + "</span></div>" : '');
  function expandDef(def){
    return def.replace(/^\s*<(\d)>\s*([介代副助動名嘆形連]?)/, function(_, num, char){
      return String.fromCharCode(0x327F + parseInt(num)) + "" + (char ? char + "\u20DE" : '');
    }).replace(/<(\d)>/g, function(_, num){
      return String.fromCharCode(0x327F + parseInt(num));
    }).replace(/[（(](\d)[)）]/g, function(_, num){
      return String.fromCharCode(0x2789 + parseInt(num));
    }).replace(/\(/g, '（').replace(/\)/g, '）');
  }
  function ls(entries, cb){
    var x;
    entries == null && (entries = []);
    return (function(){
      var i$, ref$, len$, results$ = [];
      for (i$ = 0, len$ = (ref$ = entries).length; i$ < len$; ++i$) {
        x = ref$[i$];
        results$.push(cb(x));
      }
      return results$;
    }()).join("");
  }
  function h(text){
    text == null && (text = '');
    if (LANG === 't') {
      text = text.replace(/([\u31B4-\u31B7])([^\u0358])/g, "<span class='u31bX'>$1</span>$2");
      text = text.replace(/(\u31B4)\u0358/g, "<span class='u31b4-0358'>$1\u0358</span>");
      text = text.replace(/(\u31B5)\u0358/g, "<span class='u31b5-0358'>$1\u0358</span>");
      text = text.replace(/(\u31B6)\u0358/g, "<span class='u31b6-0358'>$1\u0358</span>");
      text = text.replace(/(\u31B7)\u0358/g, "<span class='u31b7-0358'>$1\u0358</span>");
      if (isDroidGap) {
        text = text.replace(/([aieou])\u030d/g, "<span class='$1-030d'>$1\u030d</span>");
      } else {
        text = text.replace(/([i])\u030d/g, "<span class='$1-030d'>$1\u030d</span>");
      }
    }
    return text.replace(/\uFF0E/g, '\u00B7').replace(/\u223C/g, '\uFF0D').replace(/\u0358/g, '\u030d');
  }
  function groupBy(prop, xs){
    var x, pre, y;
    if (xs.length <= 1) {
      return [xs];
    }
    x = xs.shift();
    x[prop] == null && (x[prop] = '');
    pre = [x];
    while (xs.length) {
      y = xs[0];
      y[prop] == null && (y[prop] = '');
      if (x[prop] !== y[prop]) {
        break;
      }
      pre.push(xs.shift());
    }
    if (!xs.length) {
      return [pre];
    }
    return [pre].concat(slice$.call(groupBy(prop, xs)));
  }
  return groupBy;
}

// copy var from moedict-webkit
var CJKRADICALS = '⼀一⼁丨⼂丶⼃丿⼄乙⼅亅⼆二⼇亠⼈人⼉儿⼊入⼋八⼌冂⼍冖⼎冫⼏几⼐凵⼑刀⼒力⼓勹⼔匕⼕匚⼖匸⼗十⼘卜⼙卩⼚厂⼛厶⼜又⼝口⼞囗⼟土⼠士⼡夂⼢夊⼣夕⼤大⼥女⼦子⼧宀⼨寸⼩小⼪尢⼫尸⼬屮⼭山⼮巛⼯工⼰己⼱巾⼲干⼳幺⼴广⼵廴⼶廾⼷弋⼸弓⼹彐⼺彡⼻彳⼼心⼽戈⼾戶⼿手⽀支⽁攴⽂文⽃斗⽄斤⽅方⽆无⽇日⽈曰⽉月⽊木⽋欠⽌止⽍歹⽎殳⽏毋⽐比⽑毛⽒氏⽓气⽔水⽕火⽖爪⽗父⽘爻⽙爿⺦丬⽚片⽛牙⽜牛⽝犬⽞玄⽟玉⽠瓜⽡瓦⽢甘⽣生⽤用⽥田⽦疋⽧疒⽨癶⽩白⽪皮⽫皿⽬目⽭矛⽮矢⽯石⽰示⽱禸⽲禾⽳穴⽴立⽵竹⽶米⽷糸⺰纟⽸缶⽹网⽺羊⽻羽⽼老⽽而⽾耒⽿耳⾀聿⾁肉⾂臣⾃自⾄至⾅臼⾆舌⾇舛⾈舟⾉艮⾊色⾋艸⾌虍⾍虫⾎血⾏行⾐衣⾑襾⾒見⻅见⾓角⾔言⻈讠⾕谷⾖豆⾗豕⾘豸⾙貝⻉贝⾚赤⾛走⾜足⾝身⾞車⻋车⾟辛⾠辰⾡辵⻌辶⾢邑⾣酉⾤釆⾥里⾦金⻐钅⾧長⻓长⾨門⻔门⾩阜⾪隶⾫隹⾬雨⾭靑⾮非⾯面⾰革⾱韋⻙韦⾲韭⾳音⾴頁⻚页⾵風⻛风⾶飛⻜飞⾷食⻠饣⾸首⾹香⾺馬⻢马⾻骨⾼高⾽髟⾾鬥⾿鬯⿀鬲⿁鬼⿂魚⻥鱼⻦鸟⿃鳥⿄鹵⻧卤⿅鹿⿆麥⻨麦⿇麻⿈黃⻩黄⿉黍⿊黑⿋黹⿌黽⻪黾⿍鼎⿎鼓⿏鼠⿐鼻⿑齊⻬齐⿒齒⻮齿⿓龍⻰龙⿔龜⻳龟⿕龠';
SIMPTRAD = (ref$ = window.SIMPTRAD) != null ? ref$ : '';
function b2g(str){
  var rv, i$, ref$, len$, char, idx;
  str == null && (str = '');
  if (!((LANG === 'a' || LANG === 'c') && !/^@/.test(str))) {
    return str;
  }
  rv = '';
  for (i$ = 0, len$ = (ref$ = split$.call(str, '')).length; i$ < len$; ++i$) {
    char = ref$[i$];
    idx = SIMPTRAD.indexOf(char);
    rv += idx % 2
      ? char
      : SIMPTRAD[idx + 1];
  }
  return rv;
}
function renderRadical(char){
  var idx;
  idx = CJKRADICALS.indexOf(char);
  if (!(idx % 2)) {
    char = CJKRADICALS[idx + 1];
  }
  if (LANG !== 'a') {
    return char;
  }
  return "<a title='部首檢索' class='xref' style='color: white' href='#@" + char + "'> " + char + "</a>";
}

function trs2bpmf(trs){
  if (LANG === 'h') {
    return ' ';
  }
  if (LANG === 'a') {
    return trs;
  }
  return trs.replace(/[A-Za-z\u0300-\u030d]+/g, function(it){
    var tone;
    tone = '';
    it = it.toLowerCase();
    it = it.replace(/([\u0300-\u0302\u0304\u030d])/, function(it){
      tone = Tones[it];
      return '';
    });
    it = it.replace(/^(tsh?|[sj])i/, '$1ii');
    it = it.replace(/ok$/, 'ook');
    it = it.replace(RegExp('^(' + C + ')((?:' + V + ')+[ptkh]?)$'), function(){
      return Consonants[arguments[1]] + arguments[2];
    });
    it = it.replace(/[ptkh]$/, function(it){
      tone = Tones[it + tone];
      return '';
    });
    it = it.replace(RegExp('(' + V + ')', 'g'), function(it){
      return Vowels[it];
    });
    return it + (tone || '\uFFFD');
  }).replace(/[- ]/g, '').replace(/\uFFFD/g, ' ').replace(/\. ?/g, '。').replace(/\? ?/g, '？').replace(/\! ?/g, '！').replace(/\, ?/g, '，');
}
