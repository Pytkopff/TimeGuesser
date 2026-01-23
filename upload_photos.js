require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const BUCKET_NAME = 'game-images';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Błąd: Brak kluczy w pliku .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_COUNT = 100;
const YEAR_RANGES = [
  { start: 1900, end: 1959, weight: 1 },
  { start: 1960, end: 1979, weight: 2 },
  { start: 1980, end: 1999, weight: 4 },
  { start: 2000, end: 2009, weight: 5 },
  { start: 2010, end: 2024, weight: 6 }
];

const SEARCH_KEYWORDS = [
  "street",
  "city",
  "square",
  "market",
  "station",
  "metro",
  "tram",
  "train",
  "bus",
  "traffic",
  "cars",
  "people",
  "crowd",
  "parade",
  "festival",
  "protest",
  "concert",
  "stadium",
  "olympics",
  "fashion",
  "airport",
  "school",
  "university",
  "office",
  "factory",
  "newspaper",
  "television",
  "computer",
  "phone"
];

const GOOD_TITLE_HINTS = [
  "street",
  "city",
  "square",
  "market",
  "station",
  "metro",
  "tram",
  "train",
  "bus",
  "traffic",
  "cars",
  "people",
  "crowd",
  "parade",
  "festival",
  "protest",
  "concert",
  "stadium",
  "olympics",
  "fashion",
  "airport",
  "school",
  "university",
  "office",
  "factory",
  "newspaper",
  "television",
  "computer",
  "phone",
  "president",
  "queen",
  "king",
  "pope",
  "beatles",
  "elvis",
  "einstein"
];

const BAD_TITLE_HINTS = [
  "logo",
  "map",
  "diagram",
  "chart",
  "drawing",
  "painting",
  "illustration",
  "manuscript",
  "document",
  "inscription",
  "stone",
  "rock",
  "coin",
  "stamp",
  "flag",
  "coat of arms",
  "heraldry",
  "mosaic",
  "sculpture",
  "floorplan",
  "poster",
  "sign",
  "cover",
  "album"
];

const WIKI_API_BASE = "https://commons.wikimedia.org/w/api.php";
const REQUEST_DELAY_MS = 3000;
const MAX_RETRIES = 10;
const MIN_REQUEST_INTERVAL_MS = 2500;
const COOLDOWN_ON_429_MS = 30000;
const MAX_BACKOFF_MS = 60000;
const MAX_DOWNLOAD_BYTES = 8 * 1024 * 1024;
const MANIFEST_PATH = path.join(__dirname, 'upload_manifest.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let lastRequestAt = 0;

async function enforceRateLimit() {
  const now = Date.now();
  const waitFor = Math.max(0, MIN_REQUEST_INTERVAL_MS - (now - lastRequestAt));
  if (waitFor > 0) await sleep(waitFor);
  lastRequestAt = Date.now();
}

async function fetchWithRetry(
  url,
  options = {},
  retries = MAX_RETRIES,
  cooldownOn429Ms = 0
) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await enforceRateLimit();
    const response = await fetch(url, options);
    if (response.ok) return response;
    if ((response.status === 429 || response.status === 503) && attempt < retries) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : 0;
      const backoff = Math.min(MAX_BACKOFF_MS, 1500 * 2 ** attempt);
      await sleep(Math.max(backoff, retryAfterMs, cooldownOn429Ms));
      continue;
    }
    return response;
  }
  return fetch(url, options);
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    return { success: [], failed: [] };
  }
  try {
    const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      success: Array.isArray(parsed.success) ? parsed.success : [],
      failed: Array.isArray(parsed.failed) ? parsed.failed : []
    };
  } catch (err) {
    console.warn('⚠️  Nie mogę odczytać manifestu, startuję od zera.');
    return { success: [], failed: [] };
  }
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

function buildWeightedYears() {
  const weighted = [];
  for (const range of YEAR_RANGES) {
    for (let year = range.start; year <= range.end; year += 1) {
      for (let i = 0; i < range.weight; i += 1) {
        weighted.push(year);
      }
    }
  }
  return weighted;
}

function humanizeFileTitle(fileTitle) {
  if (!fileTitle) return "Untitled";
  const noPrefix = fileTitle.replace(/^File:/i, "");
  const noExt = noPrefix.replace(/\.[a-zA-Z0-9]+$/, "");
  return noExt.replace(/_/g, " ").trim();
}

function titleLooksGuessable(title) {
  if (!title) return false;
  const lower = title.toLowerCase();
  if (BAD_TITLE_HINTS.some((hint) => lower.includes(hint))) return false;
  return GOOD_TITLE_HINTS.some((hint) => lower.includes(hint));
}

async function fetchCategoryMembers(categoryTitle) {
  const url =
    `${WIKI_API_BASE}?action=query&list=categorymembers&cmtitle=` +
    `${encodeURIComponent(categoryTitle)}&cmnamespace=6&cmlimit=200&format=json`;
  const response = await fetchWithRetry(url, {
    headers: { "User-Agent": "TimeGuesserApp/1.0 (Educational Project)" }
  });
  await sleep(REQUEST_DELAY_MS);
  const data = await response.json();
  return (data?.query?.categorymembers || []).map((item) => item.title);
}

async function fetchFilesForYear(year) {
  const shuffledKeywords = [...SEARCH_KEYWORDS].sort(() => Math.random() - 0.5);
  const searchQueries = shuffledKeywords.slice(0, 6).map((keyword) => `${year} ${keyword} photograph`);
  searchQueries.unshift(`${year} street photo`);
  searchQueries.unshift(`${year} city photo`);

  for (const query of searchQueries) {
    const url =
      `${WIKI_API_BASE}?action=query&list=search&srnamespace=6&` +
      `srsearch=${encodeURIComponent(query)}&srlimit=50&format=json`;
    const response = await fetchWithRetry(url, {
      headers: { "User-Agent": "TimeGuesserApp/1.0 (Educational Project)" }
    });
    await sleep(REQUEST_DELAY_MS);
    const data = await response.json();
    const results = (data?.query?.search || []).map((item) => item.title);
    if (results.length > 0) return results;
  }

  return [];
}

async function buildPhotoList() {
  const weightedYears = buildWeightedYears();
  const usedFiles = new Set();
  const photos = [];
  const cache = new Map();
  let attempts = 0;
  const maxAttempts = TARGET_COUNT * 8;

  while (photos.length < TARGET_COUNT && attempts < maxAttempts) {
    attempts += 1;
    const year = weightedYears[Math.floor(Math.random() * weightedYears.length)];
    if (!cache.has(year)) {
      const filesForYear = await fetchFilesForYear(year);
      cache.set(year, filesForYear);
    }

    const files = cache.get(year) || [];
    if (files.length === 0) continue;

    const candidate = files[Math.floor(Math.random() * files.length)];
    if (!candidate) continue;
    const lower = candidate.toLowerCase();
    if (!(lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png'))) {
      continue;
    }
    const fileName = candidate.replace(/^File:/i, "");
    const title = humanizeFileTitle(candidate);
    if (!titleLooksGuessable(title)) continue;
    const uniqueKey = `${year}|${fileName}`;
    if (usedFiles.has(uniqueKey)) continue;

    usedFiles.add(uniqueKey);
    photos.push({
      fileName,
      year,
      title
    });
  }

  return photos;
}

// Funkcja pytająca API Wikipedii o prawdziwy link
async function getRealWikiUrl(fileName) {
  const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;
  
  const response = await fetchWithRetry(apiUrl, {
    headers: { 'User-Agent': 'TimeGuesserApp/1.0 (Educational Project)' }
  });
  await sleep(REQUEST_DELAY_MS);
  const data = await response.json();
  
  // Magia parsowania JSONa z Wikipedii
  const pages = data.query.pages;
  const firstPageId = Object.keys(pages)[0];
  
  if (firstPageId === "-1") {
    throw new Error("Nie znaleziono pliku na Wikipedii (zła nazwa?)");
  }
  
  return pages[firstPageId].imageinfo[0].url;
}

async function processPhotos() {
  console.log("🚀 Startuję migrację zdjęć (Metoda API)...");
  const photosToProcess = await buildPhotoList();
  const manifest = loadManifest();
  const successMap = new Set(
    manifest.success.map((item) => `${item.year}|${item.fileName}`)
  );
  const currentOkCount = manifest.success.length;

  if (photosToProcess.length === 0) {
    console.error("❌ Nie udało się zbudować listy zdjęć.");
    return;
  }

  console.log(`📸 Lista gotowa: ${photosToProcess.length} zdjęć do wrzucenia.`);
  console.log(`✅ Aktualnie OK: ${currentOkCount}/${TARGET_COUNT}`);

  for (const photo of photosToProcess) {
    if (manifest.success.length >= TARGET_COUNT) {
      console.log(`✅ Osiągnięto limit ${TARGET_COUNT} OK. Kończę.`);
      break;
    }
    const key = `${photo.year}|${photo.fileName}`;
    if (successMap.has(key)) {
      console.log(`⏭️  Pomijam (już dodane): ${photo.title}`);
      continue;
    }
    try {
      console.log(`🔎 Szukam linku dla: ${photo.fileName}...`);
      
      // 1. Pobierz prawdziwy URL z API
      const realUrl = await getRealWikiUrl(photo.fileName);
      console.log(`   -> Znalazłem: ${realUrl}`);

      // 2. Pobierz obrazek
      const headResponseReal = await fetchWithRetry(realUrl, { method: 'HEAD' });
      if (headResponseReal.ok) {
        const size = Number(headResponseReal.headers.get('content-length') || 0);
        if (size > MAX_DOWNLOAD_BYTES) {
          throw new Error(`Plik za duży (${Math.round(size / 1024 / 1024)} MB)`);
        }
      }

      const response = await fetchWithRetry(
        realUrl,
        { headers: { 'User-Agent': 'TimeGuesserApp/1.0 (Educational Project)' } },
        MAX_RETRIES,
        COOLDOWN_ON_429_MS
      );

      if (!response.ok) throw new Error(`Błąd pobierania: ${response.status}`);
      await sleep(REQUEST_DELAY_MS + Math.floor(Math.random() * 1500));
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 3. Przygotuj nazwę pliku (czyścimy dziwne znaki)
      const cleanTitle = photo.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 80);
      const cleanFileName = `${photo.year}_${cleanTitle}.jpg`;

      // 4. Wyślij do Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(cleanFileName, buffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) console.log(`⚠️  Storage info: ${uploadError.message}`);

      // 5. Pobierz publiczny link
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(cleanFileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error('Brak publicznego URL po uploadzie');
      }

      // 6. Szybka weryfikacja linku (HEAD, fallback GET)
      const headResponsePublic = await fetchWithRetry(publicUrlData.publicUrl, {
        method: 'HEAD'
      });
      if (!headResponsePublic.ok) {
        const getResponse = await fetchWithRetry(publicUrlData.publicUrl);
        if (!getResponse.ok) {
          throw new Error(`Publiczny URL niedostępny: ${getResponse.status}`);
        }
      }

      // 6. Zapisz w bazie danych
      const { error: dbError } = await supabase
        .from('photos')
        .upsert({
          image_url: publicUrlData.publicUrl,
          year_true: photo.year,
          title: photo.title
        }, { onConflict: 'title' });

      if (dbError) throw dbError;

      console.log(`✅ SUKCES: ${photo.title} gotowe!`);
      manifest.success.push({
        fileName: photo.fileName,
        title: photo.title,
        year: photo.year,
        publicUrl: publicUrlData.publicUrl,
        uploadedAt: new Date().toISOString()
      });
      if (manifest.success.length >= TARGET_COUNT) {
        saveManifest(manifest);
        console.log(`✅ Osiągnięto limit ${TARGET_COUNT} OK. Kończę.`);
        break;
      }
      saveManifest(manifest);

    } catch (e) {
      console.error(`❌ BŁĄD przy ${photo.title}:`, e.message);
      manifest.failed.push({
        fileName: photo.fileName,
        title: photo.title,
        year: photo.year,
        error: String(e.message),
        failedAt: new Date().toISOString()
      });
      saveManifest(manifest);
    }
  }

  console.log(`✅ Gotowe. Sukcesy: ${manifest.success.length}, błędy: ${manifest.failed.length}`);
  console.log(`📄 Manifest: ${MANIFEST_PATH}`);
}

processPhotos();