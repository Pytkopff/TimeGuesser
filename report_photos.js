require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Błąd: Brak kluczy w pliku .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function decadeLabel(year) {
  const start = Math.floor(year / 10) * 10;
  return `${start}s`;
}

async function run() {
  console.log('📊 Raport zdjęć z bazy...');
  const { data, error } = await supabase
    .from('photos')
    .select('id,title,year_true');

  if (error) {
    console.error('❌ Błąd pobierania:', error.message);
    process.exit(1);
  }

  const total = data.length;
  const byDecade = {};
  const byRange = {
    '1900-1959': 0,
    '1960-1979': 0,
    '1980-1999': 0,
    '2000-2009': 0,
    '2010-2024': 0
  };

  for (const photo of data) {
    const year = Number(photo.year_true);
    if (!Number.isFinite(year)) continue;

    const label = decadeLabel(year);
    byDecade[label] = (byDecade[label] || 0) + 1;

    if (year >= 1900 && year <= 1959) byRange['1900-1959'] += 1;
    else if (year >= 1960 && year <= 1979) byRange['1960-1979'] += 1;
    else if (year >= 1980 && year <= 1999) byRange['1980-1999'] += 1;
    else if (year >= 2000 && year <= 2009) byRange['2000-2009'] += 1;
    else if (year >= 2010 && year <= 2024) byRange['2010-2024'] += 1;
  }

  console.log(`✅ Razem: ${total}`);
  console.log('--- Zakresy lat ---');
  for (const [range, count] of Object.entries(byRange)) {
    console.log(`${range}: ${count}`);
  }

  console.log('--- Dekady ---');
  const sortedDecades = Object.keys(byDecade).sort();
  for (const decade of sortedDecades) {
    console.log(`${decade}: ${byDecade[decade]}`);
  }
}

run();
