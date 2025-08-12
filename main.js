// ----- Imports -----
import { generateMnemonic, mnemonicToSeedSync } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { createClient } from '@supabase/supabase-js';

// Set hash function for ed25519
ed25519.etc.sha512Sync = (...m) => sha512(ed25519.etc.concatBytes(...m));

// ----- DOM references -----
const genBtn     = document.getElementById('gen-btn');
const seedOut    = document.getElementById('seed-out');
const msg        = document.getElementById('msg');
const insertBtn  = document.getElementById('insert');
const fetchBtn   = document.getElementById('fetch');
const username   = document.getElementById('username');
const out        = document.getElementById('out');
const deriveBtn  = document.getElementById('derive-btn');
const pubkeyOut  = document.getElementById('pubkey-out');

// ----- 24-word seed generator -----
genBtn.onclick = () => {
  try {
    const mnemonic = generateMnemonic(wordlist, 256); // 256 bits -> 24 words
    seedOut.value = mnemonic;
  } catch (e) {
    seedOut.value = 'Error: ' + (e.message || e);
  }
};

// ----- Derive Ed25519 public key from seed -----
deriveBtn.onclick = async () => {
  try {
    const mnemonic = seedOut.value.trim();
    if (!mnemonic) {
      pubkeyOut.value = 'No seed found!';
      return;
    }
    const seedBytes = mnemonicToSeedSync(mnemonic); // 64-byte seed
    const privKey = seedBytes.slice(0, 32);         // first 32 bytes for private key
    const pubKey = await ed25519.getPublicKey(privKey);

    const toHex = (u8) =>
      Array.from(u8).map((b) => b.toString(16).padStart(2, '0')).join('');
    pubkeyOut.value = toHex(pubKey);
  } catch (e) {
    pubkeyOut.value = 'Error: ' + (e.message || e);
  }
};

// ----- Supabase client -----
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ----- Insert to Supabase -----
insertBtn.onclick = async () => {
  msg.textContent = 'Inserting…';
  out.textContent = '';
  try {
    const { data, error } = await supabase
      .from('test_table')
      .insert({ username: username.value || 'from-vite' })
      .select();
    if (error) throw error;
    msg.textContent = 'Inserted ✓';
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    msg.textContent = 'Insert error';
    out.textContent = 'Insert error: ' + (e.message || e);
  }
};

// ----- Fetch from Supabase -----
fetchBtn.onclick = async () => {
  msg.textContent = 'Fetching…';
  out.textContent = '';
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    msg.textContent = 'Fetched ✓';
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    msg.textContent = 'Fetch error';
    out.textContent = 'Fetch error: ' + (e.message || e);
  }
};