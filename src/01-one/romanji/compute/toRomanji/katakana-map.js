let out = {
  "a": "&#12450;",
  "i": "&#12452;",
  "u": "&#12454;",
  "e": "&#12456;",
  "o": "&#12458;",
  "n": "&#12531;",
  "m": "&#12531;",
  "ka": "&#12459;",
  "ki": "&#12461;",
  "ku": "&#12463;",
  "ke": "&#12465;",
  "ko": "&#12467;",
  "sa": "&#12469;",
  "si": "&#12471;",
  "su": "&#12473;",
  "se": "&#12475;",
  "so": "&#12477;",
  "ta": "&#12479;",
  "ti": "&#12481;",
  "tu": "&#12484;",
  "te": "&#12486;",
  "to": "&#12488;",
  "na": "&#12490;",
  "ni": "&#12491;",
  "nu": "&#12492;",
  "ne": "&#12493;",
  "no": "&#12494;",
  "ha": "&#12495;",
  "hi": "&#12498;",
  "fu": "&#12501;",
  "he": "&#12504;",
  "ho": "&#12507;",
  "ma": "&#12510;",
  "mi": "&#12511;",
  "mu": "&#12512;",
  "me": "&#12513;",
  "mo": "&#12514;",
  "ya": "&#12516;",
  "yu": "&#12518;",
  "yo": "&#12520;",
  "ra": "&#12521;",
  "ri": "&#12522;",
  "ru": "&#12523;",
  "re": "&#12524;",
  "ro": "&#12525;",
  "wa": "&#12527;",
  "wo": "&#12530;",
  "ga": "&#12460;",
  "gi": "&#12462;",
  "gu": "&#12464;",
  "ge": "&#12466;",
  "go": "&#12468;",
  "za": "&#12470;",
  "zi": "&#12472;",
  "zu": "&#12474;",
  "ze": "&#12476;",
  "zo": "&#12478;",
  "da": "&#12480;",
  "di": "&#12482;",
  "du": "&#12485;",
  "de": "&#12487;",
  "do": "&#12489;",
  "ba": "&#12496;",
  "bi": "&#12499;",
  "bu": "&#12502;",
  "be": "&#12505;",
  "bo": "&#12508;",
  "pa": "&#12497;",
  "pi": "&#12500;",
  "pu": "&#12503;",
  "pe": "&#12506;",
  "po": "&#12509;",
  "ja": "&#12472;&#12515;",
  "ju": "&#12472;&#12517;",
  "jo": "&#12472;&#12519;",
  "ji": "&#12472;",
  "vi": "&#12532;&#12451;",
  "kya": "&#12461;&#12515;",
  "kyu": "&#12461;&#12517;",
  "kyo": "&#12461;&#12519;",
  "sha": "&#12471;&#12515;",
  "shu": "&#12471;&#12517;",
  "sho": "&#12471;&#12519;",
  "shi": "&#12471;",
  "tsu": "&#12484;",
  "cha": "&#12481;&#12515;",
  "chu": "&#12481;&#12517;",
  "cho": "&#12481;&#12519;",
  "chi": "&#12481;",
  "nya": "&#12491;&#12515;",
  "nyu": "&#12491;&#12517;",
  "nyo": "&#12491;&#12519;",
  "hya": "&#12498;&#12515;",
  "hyu": "&#12498;&#12517;",
  "hyo": "&#12498;&#12519;",
  "mya": "&#12511;&#12515;",
  "myu": "&#12511;&#12517;",
  "myo": "&#12511;&#12519;",
  "rya": "&#12522;&#12515;",
  "ryu": "&#12522;&#12517;",
  "ryo": "&#12522;&#12519;",
  "gya": "&#12462;&#12515;",
  "gyu": "&#12462;&#12517;",
  "gyo": "&#12462;&#12519;",
  "bya": "&#12499;&#12515;",
  "byu": "&#12499;&#12517;",
  "byo": "&#12499;&#12519;",
  "pya": "&#12500;&#12515;",
  "pyu": "&#12500;&#12517;",
  "pyo": "&#12500;&#12519;",
  "tsu": "&#12483;"
}

const toUtf8 = function (s) {
  return decodeURIComponent(s)
}

Object.entries(out).forEach(a => {
  let num = a[1].replace(/&#/g, '').replace(/;/, '')
  let hex = Number(num).toString(16);
  // console.log('\\u' + hex)
  console.log(toUtf8('\\u' + hex))
})


// console.log(toUtf8('\u30a2\u30e1\u30ea\u30ab\u5408\u8846\u56fd')) //アメリカ合衆国 (USA)
// console.log(toUtf8('\u12496'))