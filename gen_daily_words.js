// gen_daily_words.js
// Generates 365 days of word lists with US holiday overrides (and a patriotic week).
// Run: node gen_daily_words.js > daily-words.json

//////////////////////
// FAMILY-FRIENDLY GENERAL POOLS
//////////////////////
const WORD_POOLS = {
  "Animals": ["DOG","CAT","HORSE","LION","TIGER","BEAR","MONKEY","FISH","BIRD","FROG","WHALE","SHARK","MOUSE","ZEBRA","PANDA","KOALA","SNAIL","CRAB","OTTER","RABBIT","DEER","FOX","SEAL","EAGLE"],
  "Fruits": ["APPLE","BANANA","CHERRY","ORANGE","PEAR","PEACH","GRAPE","MANGO","PLUM","LEMON","LIME","KIWI","BERRY","APRICOT","PAPAYA","FIG","DATES","GUAVA"],
  "Vegetables": ["CARROT","BROCCOLI","CABBAGE","BEANS","CORN","PEAS","ONION","GARLIC","POTATO","LETTUCE","SPINACH","CELERY","CUCUMBER","RADISH","TOMATO","PEPPER","SQUASH","KALE"],
  "Sports": ["SOCCER","BASEBALL","FOOTBALL","HOCKEY","GOLF","TENNIS","SWIMMING","RUNNING","CYCLING","BASKETBALL","SKIING","SURFING","VOLLEYBALL","KARATE","SKATING","ROWING"],
  "Colors": ["RED","BLUE","GREEN","YELLOW","PURPLE","PINK","BLACK","WHITE","BROWN","ORANGE","SILVER","GOLD","CYAN","MAGENTA","INDIGO","VIOLET"],
  "Weather": ["SUNNY","CLOUDY","RAIN","SNOW","STORM","LIGHTNING","THUNDER","FOG","BREEZE","WIND","HURRICANE","RAINBOW","DRIZZLE","HAIL","SLEET","MIST"],
  "Transportation": ["CAR","BUS","TRAIN","PLANE","BOAT","SHIP","TRUCK","BICYCLE","SCOOTER","HELICOPTER","SUBWAY","TRAM","KAYAK","CANOE","TAXI","MOTORBIKE"],
  "Nature": ["TREE","FLOWER","RIVER","MOUNTAIN","OCEAN","LAKE","DESERT","FOREST","ISLAND","VOLCANO","VALLEY","WATERFALL","MEADOW","CANYON","CLIFF","BEACH"],
  "Music": ["SONG","PIANO","GUITAR","DRUMS","VIOLIN","TRUMPET","FLUTE","SING","DANCE","LYRICS","BAND","MELODY","RHYTHM","CHORUS","OPERA","HARMONY"],
  "School": ["BOOK","PENCIL","ERASER","RULER","DESK","BOARD","TEACHER","STUDENT","CLASS","MATH","SCIENCE","HISTORY","ART","MUSIC","GYM","RECESS"],
  "Ocean": ["CORAL","REEF","SEAWEED","DOLPHIN","OCTOPUS","SEAHORSE","JELLYFISH","TURTLE","ANCHOR","HARBOR","TIDE","CURRENT","WAVES","SHELL","STARFISH"],
  "Camping": ["TENT","CAMPFIRE","MARSHMALLOW","SLEEPINGBAG","COMPASS","MAP","HIKING","TRAIL","FOREST","BACKPACK","FLASHLIGHT","BINOCULARS","CANOE","FISHING"]
};

//////////////////////
// HOLIDAY-SPECIFIC POOLS
//////////////////////
const HOLIDAY_POOLS = {
  "NewYear": ["NEWYEAR","MIDNIGHT","COUNTDOWN","FIREWORKS","CELEBRATE","PARTY","RESOLUTION","CONFETTI","CALENDAR","JANUARY","BALLOON","TOAST"],
  "MLKDay": ["DREAM","EQUALITY","FREEDOM","PEACE","COURAGE","JUSTICE","UNITY","SPEECH","LEADERSHIP","SERVICE","HOPE","INSPIRE"],
  "PresidentsDay": ["PRESIDENT","LINCOLN","WASHINGTON","LEADERS","HISTORY","MONUMENT","WHITEHOUSE","LIBERTY","VOTES","FLAG","NATION","UNION"],
  "StPatricks": ["SHAMROCK","LEPRECHAUN","RAINBOW","POTOGOLD","GREEN","CHARM","LUCKY","IRISH","PARADE","CLOVER","CHEER","DANCE"],
  "Easter": ["EASTER","BUNNY","EGG","BASKET","SPRING","FLOWERS","SUNDAY","HUNT","CHICK","TULIP","JELLYBEANS","BONNET"],
  "MothersDay": ["MOTHER","FLOWERS","BRUNCH","LOVE","CARD","HUGS","FAMILY","SMILE","CARING","THANKYOU","HEART","JOY"],
  "MemorialDay": ["MEMORIAL","REMEMBER","HONOR","FLAGS","PARADE","WREATH","COURAGE","SERVICE","COUNTRY","TRIBUTE","LIBERTY","STAR"],
  "Juneteenth": ["JUNETEENTH","FREEDOM","CELEBRATE","HISTORY","JUBILEE","PARADE","UNITY","HERITAGE","COMMUNITY","HOPE","REFLECTION","COURAGE"],
  "FathersDay": ["FATHER","DAD","BBQ","TOOLS","TIE","FAMILY","SMILE","CARD","SPORTS","HUGS","THANKYOU","PROUD"],
  "IndependenceDay": ["FREEDOM","LIBERTY","AMERICA","FLAG","EAGLE","FIREWORKS","PARADE","JULYFOURTH","DECLARATION","HOMELAND","STARS","STRIPES"],
  "LaborDay": ["LABORDAY","WORKERS","REST","PICNIC","PARADE","UNION","HOLIDAY","SEPTEMBER","COMMUNITY","TEAMWORK","BREAK","BBQ"],
  "Halloween": ["HALLOWEEN","PUMPKIN","COSTUME","CANDY","SPOOKY","GHOST","BAT","SPIDER","WITCH","BROOM","SKULL","ZOMBIE"],
  "Thanksgiving": ["THANKSGIVING","TURKEY","FAMILY","GRATITUDE","FEAST","PUMPKINPIE","CRANBERRY","STUFFING","THURSDAY","AUTUMN","HARVEST","LEFTOVERS"],
  "VeteransDay": ["VETERANS","SERVICE","HONOR","SALUTE","COURAGE","COUNTRY","DUTY","RESPECT","BRAVERY","PARADE","TRIBUTE","REMEMBER"],
  "Christmas": ["CHRISTMAS","SANTA","REINDEER","ELF","PRESENTS","TREE","ORNAMENT","CAROLS","SLEIGH","SNOW","WREATH","COOKIE"],
  "Valentine": ["VALENTINE","HEART","LOVE","FLOWERS","CUPID","CHOCOLATE","KISSES","ROMANCE","CARD","SWEETHEART","HUGS","ARROW"],
  "Patriotic": ["AMERICA","FLAG","STARS","STRIPES","FREEDOM","LIBERTY","EAGLE","INDEPENDENCE","FIREWORKS","COUNTRY","JUSTICE","HONOR"]
};

const WORDS_PER_PUZZLE = 12;
const DAYS = 365;
const TIMEZONE = 'America/Chicago';

//////////////////////
// RNG helpers
//////////////////////
function cyrb128(str){ let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762; for(let i=0,k;i<str.length;i++){ k=str.charCodeAt(i); h1=h2^Math.imul(h1^k,597399067); h2=h3^Math.imul(h2^k,2869860233); h3=h4^Math.imul(h3^k,951274213); h4=h1^Math.imul(h4^k,2716044179);} h1=Math.imul(h3^(h1>>>18),597399067); h2=Math.imul(h4^(h2>>>22),2869860233); h3=Math.imul(h1^(h3>>>17),951274213); h4=Math.imul(h2^(h4>>>19),2716044179); return [(h1^h2^h3^h4)>>>0]; }
function mulberry32(a){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^(t>>>15), t|1); t^=t+Math.imul(t^(t>>>7), t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function rngFromSeed(seedStr){ const [a]=cyrb128(seedStr); return mulberry32(a); }
function shuffle(arr, rnd){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

function chicagoISODate(d=new Date()){ return new Intl.DateTimeFormat('en-CA',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(d); }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

//////////////////////
// Easter calc
//////////////////////
function easterSunday(y){ const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=1+((h+l-7*m+114)%31); return new Date(y,month-1,day); }

//////////////////////
// Holiday detection
//////////////////////
function usHolidayKeyForDate(d){
  const y=d.getFullYear(), m=d.getMonth(), date=d.getDate(), dow=d.getDay();
  if (m===0 && date===1) return "NewYear";
  if (m===1 && date===14) return "Valentine";
  if (m===2 && date===17) return "StPatricks";
  if (sameDay(d,easterSunday(y))) return "Easter";
  if (m===4 && dow===0 && date>=8 && date<=14) return "MothersDay"; // 2nd Sun May
  if (m===4 && dow===1 && date>=25 && date<=31) return "MemorialDay"; // last Mon May
  if (m===5 && date===19) return "Juneteenth";
  if (m===5 && dow===0 && date>=15 && date<=21) return "FathersDay"; // 3rd Sun Jun
  if (m===6 && date===4) return "IndependenceDay";
  if (m===8 && dow===1 && date<=7) return "LaborDay"; // 1st Mon Sept
  if (m===9 && date===31) return "Halloween";
  if (m===10 && dow===4 && date>=22 && date<=28) return "Thanksgiving"; // 4th Thu Nov
  if (m===10 && date===11) return "VeteransDay";
  if (m===11 && date===25) return "Christmas";
  return null;
}

//////////////////////
// Patriotic week (July 1–7)
//////////////////////
function isPatrioticWeek(d){
  return d.getMonth()===6 && d.getDate()>=1 && d.getDate()<=7;
}

//////////////////////
// MAIN
//////////////////////
let start=new Date();
if(process.argv[2]){ const p=new Date(process.argv[2]); if(!isNaN(p)) start=p; }

const out={};
const generalThemes=Object.keys(WORD_POOLS);

for(let i=0;i<DAYS;i++){
  const dateObj=addDays(start,i);
  const dateKey=chicagoISODate(dateObj);
  const rnd=rngFromSeed("BA_WORD_"+dateKey);
  let theme,words;

  if(isPatrioticWeek(dateObj)){
    theme="Patriotic";
    words=shuffle(HOLIDAY_POOLS.Patriotic,rnd).slice(0,WORDS_PER_PUZZLE);
  } else {
    const hKey=usHolidayKeyForDate(dateObj);
    if(hKey && HOLIDAY_POOLS[hKey]){
      theme=hKey;
      words=shuffle(HOLIDAY_POOLS[hKey],rnd).slice(0,WORDS_PER_PUZZLE);
    } else {
      theme=generalThemes[Math.floor(rnd()*generalThemes.length)];
      words=shuffle(WORD_POOLS[theme],rnd).slice(0,WORDS_PER_PUZZLE);
    }
  }
  words=[...new Set(words.map(w=>w.toUpperCase()))].filter(w=>/^[A-Z]{3,20}$/.test(w));
  out[dateKey]={theme,words};
}

process.stdout.write(JSON.stringify(out,null,2));
