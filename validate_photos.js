require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Błąd: Brak kluczy w pliku .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const REPORT_PATH = path.join(__dirname, 'validate_report.json');

const MAX_RETRIES = 4;
const REQUEST_DELAY_MS = 800;
const MAX_CONCURRENT = 4;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const response = await fetch(url, options);
    if (response.ok) return response;
    if ((response.status === 429 || response.status === 503) && attempt < retries) {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterMs = retryAfter ? Number(retryAfter) * 1000 : 0;
      const backoff = Math.min(8000, 500 * 2 ** attempt);
      await sleep(Math.max(backoff, retryAfterMs));
      continue;
    }
    return response;
  }
  return fetch(url, options);
}

async function checkUrl(url) {
  const head = await fetchWithRetry(url, { method: 'HEAD' });
  if (head.ok) return true;
  const get = await fetchWithRetry(url);
  return get.ok;
}

async function run() {
  console.log('🔍 Start walidacji zdjęć w bazie...');
  const { data, error } = await supabase.from('photos').select('id,image_url,title,year_true');

  if (error) {
    console.error('❌ Błąd pobierania zdjęć z bazy:', error.message);
    process.exit(1);
  }

  const report = { ok: [], failed: [] };
  let index = 0;

  async function worker() {
    while (true) {
      const currentIndex = index;
      index += 1;
      if (currentIndex >= data.length) return;

      const photo = data[currentIndex];
      try {
        const ok = await checkUrl(photo.image_url);
        await sleep(REQUEST_DELAY_MS);
        if (ok) {
          report.ok.push(photo);
          console.log(`✅ OK: ${photo.title ?? photo.id}`);
        } else {
          report.failed.push({ ...photo, error: 'URL not reachable' });
          console.log(`❌ FAIL: ${photo.title ?? photo.id}`);
        }
      } catch (err) {
        report.failed.push({ ...photo, error: String(err.message || err) });
        console.log(`❌ FAIL: ${photo.title ?? photo.id}`);
      }
    }
  }

  const workers = Array.from({ length: MAX_CONCURRENT }, () => worker());
  await Promise.all(workers);

  if (report.failed.length > 0) {
    const idsToDelete = report.failed.map((item) => item.id);
    const { error: deleteError } = await supabase.from('photos').delete().in('id', idsToDelete);
    if (deleteError) {
      console.error('❌ Błąd kasowania złych rekordów:', deleteError.message);
    } else {
      console.log(`🗑️  Usunięto: ${idsToDelete.length} rekordów z photos`);
    }
  }

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`📄 Raport: ${REPORT_PATH}`);
  console.log(`✅ OK: ${report.ok.length} | ❌ FAIL: ${report.failed.length}`);
}

run();
