  // test-reset-link.js
// Run with: node test-reset-link.js
// Requires: npm install @supabase/supabase-js

import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase dashboard > Settings > API
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY; // NEVER expose this in client code

const EMAIL = process.env.RESET_EMAIL || 'your-email@example.com'; // Account to reset
const REDIRECT = process.env.REDIRECT_URL || 'https://terra-investai.com/reset-password';

const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

const run = async () => {
  console.log('Generating recovery link for:', EMAIL);
  console.log('Redirect to:', REDIRECT);

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email: EMAIL,
    options: { redirectTo: REDIRECT }
  });

  if (error) {
    console.error('❌ generateLink error:', error);
    process.exit(1);
  }

  const actionLink = data?.properties?.action_link;
  if (!actionLink) {
    console.error('❌ No action_link returned');
    process.exit(1);
  }

  console.log('\n✅ SUCCESS! Open this link in a NEW INCOGNITO WINDOW immediately:');
  console.log('='.repeat(80));
  console.log(actionLink);
  console.log('='.repeat(80));
  console.log('\nThis bypasses email scanners. If it works, the issue is email link mangling.');
  console.log('If it doesn\'t work, there\'s still an app/Supabase config issue.');
};

run().catch(console.error);