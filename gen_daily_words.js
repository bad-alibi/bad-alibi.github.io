// gen_daily_words.js
// Generates 365 days of word lists with US holiday overrides (and a patriotic week),
// all aligned to the America/Chicago calendar day.
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

//////////////////////
// RNG helpers
//////////////////////
function cyrb128(str){
  let h1=1779033703,h2=3144134277,h3=1013904242,h4=2773480762;
  for(let i=0,k;i<str.length;i++){
    k=str.charCodeAt(i);
    h1=h2^Math.imul(h1^k,597399067);
    h2=h3^Math.imul(h2^k,2869860233);
    h3=h4^Math.imul(h3^k,951274213);
    h4=h1^Math.imul(h4^k,2716044179);
  }
  h1=Math.imul(h3^(h1>>>18),597399067);
  h2=Math.imul(h4^(h2>>>22),2869860233);
  h3=Math.imul(h1^(h3>>>17),951274213);
  h4=Math.imul(h2^(h4>>>19),2716044179);
  return [(h1^h2^h3^h4)>>>0];
}
function mulberry32(a){
  return function(){
    let t=a+=0x6D2B79F5;
    t=Math.imul(t^(t>>>15), t|1);
    t^=t+Math.imul(t^(t>>>7), t|61);
    return ((t^(t>>>14))>>>0)/4294967296;
  };
}
function rngFromSeed(seedStr){
  const [a]=cyrb128(seedStr); return mulberry32(a);
}
function shuffle(arr, rnd){
  const a=arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rnd()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

//////////////////////
// TIMEZONE-SAFE HELPERS (Chicago)
//////////////////////
const TIMEZONE = 'America/Chicago';
const MS_PER_DAY = 86_400_000;

function chicagoFields(dateObj=new Date()){
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short'
  });
  const parts = fmt.formatToParts(dateObj).reduce((o,p)=> (o[p.type]=p.value, o), {});
  const y = +parts.year, m = +parts.month, dayNum = +parts.day;
  const dowMap = {Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6};
  const dow = dowMap[(parts.weekday || '').slice(0,3)] ?? 0;
  const utcMidnight = new Date(Date.UTC(y, m-1, dayNum));
  return { y, m, dayNum, dow, utcMidnight };
}

function chicagoISODate(dateObj=new Date()){
  const { y, m, dayNum } = chicagoFields(dateObj);
  const mm = String(m).padStart(2,'0');
  const dd = String(dayNum).padStart(2,'0');
  return `${y}-${mm}-${dd}`;
}

function addDaysUTC(utcMidnightDate, n){
  return new Date(utcMidnightDate.getTime() + n*MS_PER_DAY);
}

//////////////////////
// Easter (returns Y/M/D)
//////////////////////
function easterSundayYMD(y){
  const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),
        g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,
        l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),
        month=Math.floor((h+l-7*m+114)/31), day=1+((h+l-7*m+114)%31);
  return { y, m: month, d: day };
}

//////////////////////
// Holiday detection (Chicago calendar)
//////////////////////
function usHolidayKeyForChicago(dateObj){
  const { y, m, dayNum, dow } = chicagoFields(dateObj);
  const easter = easterSundayYMD(y);

  if (m===1  && dayNum===1)  return "NewYear";
  if (m===2  && dayNum===14) return "Valentine";
  if (m===3  && dayNum===17) return "StPatricks";
  if (m===easter.m && dayNum===easter.d) return "Easter";

  if (m===5 && dow===0 && dayNum>=8  && dayNum<=14) return "MothersDay";
  if (m===5 && dow===1 && dayNum>=25 && dayNum<=31) return "MemorialDay";

  if (m===6 && dayNum===19) return "Juneteenth";
  if (m===6 && dow===0 && dayNum>=15 && dayNum<=21) return "FathersDay";

  if (m===7 && dayNum===4) return "IndependenceDay";

  if (m===9 && dow===1 && dayNum<=7) return "LaborDay";

  if (m===10 && dayNum===31) return "Halloween";

  if (m===11 && dow===4 && dayNum>=22 && dayNum<=28) return "Thanksgiving";
  if (m===11 && dayNum===11) return "VeteransDay";

  if (m===12 && dayNum===25) return "Christmas";

  return null;
}

//////////////////////
// Patriotic week (Chicago calendar)
//////////////////////
function isPatrioticWeekChicago(dateObj){
  const { m, dayNum } = chicagoFields(dateObj);
  return m===7 && dayNum>=1 && dayNum<=7; // July 1–7
}

//////////////////////
// MAIN
//////////////////////
const WORDS_REGEX = /^[A-Z]{3,20}$/;
const DAYS_TO_GENERATE = DAYS;

// Optional: allow a manual start date via CLI arg (e.g., 2025-01-01)
let start = new Date();
if (process.argv[2]) {
  const parsed = new Date(process.argv[2]);
  if (!isNaN(parsed)) start = parsed;
}

const out = {};
const generalThemes = Object.keys(WORD_POOLS);

const startFields = chicagoFields(start);
let startUTC = startFields.utcMidnight;

for (let i=0; i<DAYS_TO_GENERATE; i++){
  const dayUTC = addDaysUTC(startUTC, i);
  const dateKey = chicagoISODate(dayUTC);
  const rnd = rngFromSeed("BA_WORD_" + dateKey);

  let theme, words;
  if (isPatrioticWeekChicago(dayUTC)) {
    theme = "Patriotic";
    words = shuffle(HOLIDAY_POOLS.Patriotic, rnd).slice(0, WORDS_PER_PUZZLE);
  } else {
    const hKey = usHolidayKeyForChicago(dayUTC);
    if (hKey && HOLIDAY_POOLS[hKey]) {
      theme = hKey;
      words = shuffle(HOLIDAY_POOLS[hKey], rnd).slice(0, WORDS_PER_PUZZLE);
    } else {
      theme = generalThemes[Math.floor(rnd() * generalThemes.length)];
      words = shuffle(WORD_POOLS[theme], rnd).slice(0, WORDS_PER_PUZZLE);
    }
  }

  words = [...new Set(words.map(w => w.toUpperCase()))].filter(w => WORDS_REGEX.test(w));
  out[dateKey] = { theme, words };
}

process.stdout.write(JSON.stringify(out, null, 2));
