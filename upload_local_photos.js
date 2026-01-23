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

const SOURCE_DIR = process.argv[2];
if (!SOURCE_DIR) {
  console.error('❌ Podaj ścieżkę do folderu ze zdjęciami.');
  console.error('Przykład: node upload_local_photos.js "C:\\Users\\Maciek\\Desktop\\fotki"');
  process.exit(1);
}

const allowedExt = new Set(['.jpg', '.jpeg', '.png']);

function parseFileName(fileName) {
  const base = path.basename(fileName, path.extname(fileName));
  const match = base.match(/^(\d{4})[_\- ]+(.*)$/);
  if (!match) return null;
  const year = Number(match[1]);
  const rawTitle = match[2].replace(/[_\-]+/g, ' ').trim();
  return {
    year,
    title: rawTitle.length > 0 ? rawTitle : `Photo ${match[1]}`
  };
}

async function deleteAllPhotos() {
  const { error } = await supabase
    .from('photos')
    .delete()
    .not('id', 'is', null);

  if (error) throw error;
  console.log('🗑️  Wyczyściłem tabelę photos.');
}

async function listAllFiles() {
  const all = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit, offset });

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data.map((item) => item.name));
    if (data.length < limit) break;
    offset += limit;
  }

  return all;
}

async function deleteAllStorageFiles() {
  const files = await listAllFiles();
  if (files.length === 0) {
    console.log('🧺 Storage jest pusty.');
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(files);

  if (error) throw error;
  console.log(`🗑️  Usunięto ${files.length} plików z Storage.`);
}

async function uploadFile(filePath, year, title) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
  const fileName = `${year}_${cleanTitle}${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
      upsert: true
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  if (!publicUrlData?.publicUrl) {
    throw new Error('Brak publicznego URL po uploadzie');
  }

  const { error: dbError } = await supabase
    .from('photos')
    .upsert(
      {
        image_url: publicUrlData.publicUrl,
        year_true: year,
        title
      },
      { onConflict: 'title' }
    );

  if (dbError) throw dbError;

  console.log(`✅ ${year} | ${title}`);
}

async function run() {
  console.log('🚀 Start: czyszczę stare dane i wrzucam nowe zdjęcia.');
  await deleteAllPhotos();
  await deleteAllStorageFiles();

  const files = fs.readdirSync(SOURCE_DIR)
    .map((file) => path.join(SOURCE_DIR, file))
    .filter((file) => fs.statSync(file).isFile())
    .filter((file) => allowedExt.has(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    console.log('⚠️  Brak plików JPG/PNG w folderze.');
    return;
  }

  const seenTitles = new Set();
  for (const filePath of files) {
    const parsed = parseFileName(filePath);
    if (!parsed) {
      console.log(`⏭️  Pomijam (brak roku w nazwie): ${path.basename(filePath)}`);
      continue;
    }
    let finalTitle = parsed.title;
    if (seenTitles.has(finalTitle)) {
      const baseName = path.basename(filePath, path.extname(filePath));
      finalTitle = `${parsed.title} (${parsed.year}) ${baseName.slice(0, 24)}`;
    }
    seenTitles.add(finalTitle);
    await uploadFile(filePath, parsed.year, finalTitle);
  }

  console.log('✅ Gotowe.');
}

run().catch((err) => {
  console.error('❌ Błąd:', err.message || err);
  process.exit(1);
});
