// Quick test script to check Supabase connection
// Run: node test-supabase.js

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase connection...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('URL:', supabaseUrl.substring(0, 30) + '...');
console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('📸 Fetching photos from database...');
    const { data, error } = await supabase
      .from('photos')
      .select('id,image_url,title,year_true')
      .limit(5);

    if (error) {
      console.error('❌ Supabase error:', error.message);
      console.error('Details:', error);
      return;
    }

    console.log(`✅ Success! Found ${data?.length || 0} photos\n`);
    
    if (data && data.length > 0) {
      console.log('📋 Sample photos:');
      data.forEach((photo, i) => {
        console.log(`  ${i + 1}. ${photo.title || 'Untitled'} (${photo.year_true})`);
        console.log(`     URL: ${photo.image_url.substring(0, 60)}...`);
      });
    } else {
      console.log('⚠️  Database is empty! You need to upload photos.');
      console.log('   Run: node upload_local_photos.js');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

testConnection();
