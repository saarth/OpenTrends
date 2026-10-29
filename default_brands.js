/* Default brand and product-type dictionaries.
 *
 * Patterns use the same matcher as the scent dictionary:
 * case-insensitive substring, whole-word for terms <= 4 characters,
 * * and ? wildcards supported.
 *
 * Brand aliases include signature product names (e.g. "santal 33" -> Le Labo,
 * "mahogany teakwood" -> Bath & Body Works) so branded searches without the
 * brand name are still attributed. Mappings were checked against public brand
 * and retailer pages (see README).
 */
window.DEFAULT_BRANDS = {
  "Bath & Body Works": [
    "bath and body works", "bath & body works", "bath and bodywork", "bath body works",
    "bath and bath works", "bath bodywork", "bath bodyworks", "bath and body",
    "bath & body", "bath works", "bed and bath works", "b&bw", "body works", "bbw", "white barn",
    "wallflowers", "wallflower", "mahogany teakwood", "mahogany apple",
    "japanese cherry blossom", "warm vanilla sugar", "cucumber melon",
    "sea island cotton", "vanilla bean noel", "winter candy apple",
    "frosted coconut snowball", "strawberry pound cake", "champagne toast",
    "a thousand wishes", "black cherry merlot", "sweater weather",
    "at the beach", "into the night", "in the stars", "you're the one"
  ],
  "Yankee Candle": [
    "yankee candle", "yankee candles", "yankee candle co", "pink sands",
    "balsam and cedar", "clean cotton yankee"
  ],  "WoodWick": ["woodwick", "wood wick", "wood-wick"],
  "Diptyque": ["diptyque", "baies candle", "diptyque orpheon"],
  "Jo Malone": [
    "jo malone", "jomalone", "wood sage and sea salt", "english pear and freesia",
    "lime basil and mandarin", "mimosa and cardamom", "peony and blush suede"
  ],
  "Tom Ford": [
    "tom ford", "tomford", "black orchid", "lost cherry", "bitter peach",
    "tobacco vanille", "oud wood", "ombre leather", "neroli portofino",
    "tuscan leather", "fucking fabulous"
  ],
  "Le Labo": ["le labo", "santal 33", "another 13", "rose 31", "lelabo"],
  "Creed": ["creed", "aventus", "silver mountain water", "virgin island water"],
  "Dior": ["dior", "sauvage", "jadore", "j'adore", "miss dior", "dior homme"],
  "Chanel": ["chanel", "bleu de chanel", "coco mademoiselle", "chanel no 5", "chanel n5"],
  "Versace": [
    "versace", "bright crystal", "crystal noir", "yellow diamond",
    "versace eros", "eros flame", "dylan blue"
  ],
  "Prada": ["prada", "luna rossa", "prada carbon"],
  "Gucci": ["gucci", "flora gorgeous", "guilty perfume"],
  "Marc Jacobs": [
    "marc jacobs", "daisy perfume", "daisy love", "daisy dream", "daisy wild",
    "daisy eau so fresh"
  ],
  "Viktor & Rolf": ["viktor", "flowerbomb", "spicebomb"],
  "Ariana Grande": [
    "ariana grande", "sweet like candy", "thank u next", "cloud perfume",
    "god is a woman perfume", "moonlight perfume"
  ],
  "Kayali": ["kayali", "kay ali", "vanilla 28", "burning cherry"],
  "Maison Francis Kurkdjian": [
    "maison francis", "francis kurkdjian", "gentle fluidity", "baccarat rouge",
    "baccarat perfume", "mfk", "aqua universalis", "barakkat", "barakat", "barrakkat", "barrakat",
    "barrakat", "barakkat rouge", "barakat rouge", "barakkat rouge 540",
    "barakat rouge 540", "barakkat perfume", "barakat perfume", "baccarat 540",
    "baccarat rouge 540", "baccarat cologne"
  ],
  "Parfums de Marly": ["parfums de marly", "delina", "layton", "valaya"],
  "Byredo": ["byredo", "gypsy water", "bal d'afrique", "blanche byredo"],
  "Davidoff": ["davidoff", "cool water"],
  "Estée Lauder": ["estee lauder", "white linen", "youth dew", "beautiful perfume"],
  "Donna Karan": ["donna karan", "cashmere mist", "dkny"],
  "Elizabeth Taylor": ["elizabeth taylor", "white diamond", "white diamonds"],
  "Geoffrey Beene": ["geoffrey beene", "grey flannel"],
  "Ralph Lauren": ["ralph lauren", "polo blue", "polo red", "polo perfume"],
  "Calvin Klein": ["calvin klein", "ck one", "ck be", "eternity perfume", "obsession perfume"],
  "Giorgio Armani": [
    "giorgio armani", "armani", "acqua di gio", "acqua de gio", "acqua gio",
    "ocean di gioia", "code profumo", "si perfume", "my way perfume",
    "acqua di gio cologne", "acqua di gio parfum", "acqua di gio absolu",
    "acqua di gio profumo", "armani code", "armani si", "armani my way"
  ],
  "Acqua di Parma": [
    "acqua di parma", "acqua di parma perfume", "adp", "acqua di parma cologne",
    "acqua di parma oud", "acqua di parma leather", "acqua di parma candle"
  ],
  "Yves Saint Laurent": ["yves saint", "ysl", "black opium", "libre perfume", "la nuit"],
  "Lancôme": ["lancome", "la vie est belle", "tresor perfume"],
  "Mugler": ["mugler", "angel perfume", "alien perfume", "aura mugler"],
  "Xerjoff": ["xerjoff", "erba pura", "naxos perfume"],
  "Amouage": ["amouage", "interlude man", "reflection man"],
  "Nishane": ["nishane", "hacivat", "ani perfume"],
  "Lattafa": ["lattafa", "khamrah", "badee al oud", "yara perfume", "asad perfume", "fakhar"],
  "Armaf": ["armaf", "club de nuit"],
  "Al Haramain": ["al haramain", "haramain", "amber oud"],
  "Rasasi": ["rasasi", "hawas"],
  "Swiss Arabian": ["swiss arabian", "shaghaf"],
  "Arabian Oud": ["arabian oud"],
  "Ajmal": ["ajmal"],
  "Sand + Fog": [
    "sand and fog", "sand + fog", "sand+fog", "sand and paws", "sand & fog"
  ],
  "Thymes": ["thymes", "frasier fir"],
  "Nest New York": ["nest new york", "nest candle", "nest fragrance"],
  "Voluspa": ["voluspa"],
  "Capri Blue": ["capri blue", "volcano candle"],
  "P.F. Candle Co.": ["p.f. candle", "pf candle", "p.f candle"],
  "Boy Smells": ["boy smells"],
  "Trudon": ["trudon"],
  "Gold Canyon": ["gold canyon"],
  "Goose Creek": ["goose creek", "goosecreek"],
  "Chesapeake Bay Candle": ["chesapeake bay"],
  "Scentsy": ["scentsy"],
  "Better Homes & Gardens": ["better homes and gardens"],
  "Mainstays": ["mainstays"],
  "DW Home": ["dw home"],
  "Pura": ["pura diffuser", "pura home", "pura car", "pura scent"],
  "Little Trees": ["little trees", "little tree", "black ice air freshener", "black ice freshener"],
  "Febreze": ["febreze", "febreeze"],
  "Glade": ["glade"],
  "Air Wick": ["air wick", "airwick"],
  "OdoBan": ["odoban", "odo ban"],
  "Citrus Magic": ["citrus magic"],
  "Angry Orange": ["angry orange", "angryorange"],
  "Mrs. Meyer's": ["mrs meyer", "mrs. meyer"],
  "Tyler Candle Company": ["tyler candle", "tyler laundry", "glamorous wash", "tyler diva"],
  "Clean": [
    "clean perfume", "clean reserve", "clean classic", "clean warm cotton",
    "clean rain perfume", "clean skin perfume", "clean reserve skin"
  ],
  "Aquolina": ["aquolina", "pink sugar"],
  "Sol de Janeiro": ["sol de janeiro", "brazilian crush", "cheirosa"],
  "Victoria's Secret": [
    "victoria secret", "victorias secret", "victoria's secret", "bare vanilla",
    "love spell", "pure seduction", "bombshell perfume", "tease perfume"
  ],
  "Old Spice": ["old spice"],
  "Dove": ["dove body mist", "dove perfume", "dove deodorant"],
  "Lush": ["lush perfume", "lush bath", "lush candle"],
  "The Body Shop": ["body shop"],
  "Zara": ["zara perfume", "zara fragrance", "zara home"],
  "Glossier": ["glossier", "glossier you"],
  "Phlur": ["phlur", "missing person perfume"],
  "Juliette Has a Gun": ["juliette has a gun", "not a perfume"],
  "Dossier": ["dossier perfume", "dossier fragrance"],
  "Oakcha": ["oakcha"],
  "ALT Fragrances": ["alt fragrance", "alt perfumes"],
  "Coty": ["sand and sable", "sandal and sable"],
  "Dolce & Gabbana": [
    "dolce and gabbana", "dolce & gabbana", "dolce&gabbana", "dolce gabbana", "d&g",
    "light blue perfume", "light blue cologne", "devotion perfume"
  ],
  "Valentino": [
    "valentino perfume", "valentino fragrance", "born in roma", "voce viva",
    "valentino uomo"
  ],
  "Burberry": ["burberry", "burberry her", "mr burberry", "goddess perfume"],
  "Carolina Herrera": [
    "carolina herrera", "good girl perfume", "good girl blush", "very good girl",
    "212 perfume"
  ],
  "Jimmy Choo": ["jimmy choo"],
  "Billie Eilish": ["billie eilish"],
  "Jean Paul Gaultier": [
    "jean paul gaultier", "le male", "scandal perfume", "ultra male"
  ],
  "Paco Rabanne": [
    "paco rabanne", "1 million cologne", "one million cologne", "invictus cologne",
    "phantom perfume"
  ],
  "Azzaro": ["azzaro", "wanted cologne", "chrome cologne"],
  "Hugo Boss": ["hugo boss", "boss bottled"],
  "Montblanc": ["montblanc", "mont blanc perfume", "explorer perfume"],
  "Issey Miyake": ["issey miyake", "l'eau d'issey"],
  "Givenchy": ["givenchy", "gentleman perfume", "l'interdit"],
  "Chloé": ["chloe perfume", "chloe fragrance", "nomade perfume"],
  "Maison Margiela": [
    "maison margiela", "replica perfume", "replica scents", "replica fragrance",
    "by the fireplace", "jazz club perfume", "lazy sunday morning"
  ],
  "Coach": ["coach perfume", "coach floral", "coach dreams"],
  "Henry Rose": ["henry rose"],
  "Skylar": ["skylar perfume", "skylar fragrance"],
  "Ellis Brooklyn": ["ellis brooklyn"],
  "Le Monde Gourmand": ["le monde gourmand"],
  "DedCool": ["dedcool"],
  "By Rosie Jane": ["by rosie jane", "rosie jane"],
  "Kilian": ["kilian", "love don't be shy", "angels share"],
  "Frederic Malle": ["frederic malle", "portrait of a lady"],
  "Zoologist": ["zoologist perfume"],
  "Imaginary Authors": ["imaginary authors"],
  "Vilhelm Parfumerie": ["vilhelm"],
  "Juicy Couture": ["juicy couture"],
  "Nautica": ["nautica voyage", "nautica perfume", "nautica cologne"]
};

window.DEFAULT_PRODUCT_TYPES = {
  "Candle": ["candle", "candles", "3-wick", "three wick"],
  "Perfume": [
    "perfume", "parfum", "eau de parfum", "eau de toilette", "edp", "edt",
    "cologne", "extrait", "fragrance spray"
  ],
  "Body mist": ["body mist", "fragrance mist", "body spray", "body splash"],
  "Air freshener": [
    "air freshener", "air fresheners", "room spray", "room freshener",
    "plug in", "plug-in", "automatic freshener", "wallflowers", "wallflower",
    "odor eliminator"
  ],
  "Car freshener": [
    "car freshener", "car air freshener", "car scent", "car perfume", "car diffuser"
  ],
  "Essential oil": ["essential oil", "essential oils"],
  "Diffuser": ["diffuser", "reed diffuser", "oil diffuser", "ultrasonic diffuser"],
  "Wax melt": ["wax melt", "wax melts", "wax warmer", "wax burner", "tart melt", "wax tart"],
  "Laundry": [
    "laundry", "detergent", "fabric softener", "dryer sheet", "scent booster"
  ],
  "Incense": ["incense", "incense stick", "smudge stick", "sage bundle"],
  "Soap / body wash": ["hand soap", "body wash", "shower gel", "bar soap", "foaming soap"],
  "Lotion / body care": [
    "lotion", "body cream", "body butter", "body oil", "body lotion"
  ],
  "Deodorant": ["deodorant", "antiperspirant"],
  "Pillow / linen spray": ["pillow spray", "linen spray", "sleep spray", "sheet spray"],
  "Perfume oil": ["perfume oil", "fragrance oil", "attar", "oud oil"],
  "Candle accessory": [
    "candle holder", "candle holders", "candle warmer", "candle stand",
    "candle snuffer", "wick trimmer", "candle making"
  ]
};


// Common misspellings / variants found in Keyword Planner exports. Applied only to
// brand/product attribution, never to fragrance-family matching.
window.BRAND_NORMALIZE = {
  "barakkat": "baccarat",
  "barakat": "baccarat",
  "barrakat": "baccarat",
  "barakkat rouge": "baccarat rouge",
  "barakat rouge": "baccarat rouge",
  "barakkat rouge 540": "baccarat rouge 540",
  "barakat rouge 540": "baccarat rouge 540",
  "acqua de gio": "acqua di gio",
  "acqua gio": "acqua di gio",
  "bleu chanel": "bleu de chanel",
  "chanel de bleu": "bleu de chanel",
  "lelabo": "le labo",
  "ysl": "yves saint laurent",
  "mkf": "maison francis kurkdjian"
};
