import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://udgjjvdrgnamjrxdrvyg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ2pqdmRyZ25hbWpyeGRydnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTc1NjYsImV4cCI6MjEwNjY3MzU2Nn0.NqamufaAM0dnm8nqC9Hh6OCyfPR1CN0GxZpWmwwRnWA'
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('PROFILES DATA:', JSON.stringify(data, null, 2));
  if (error) console.log('ERROR:', error);
}

check();
