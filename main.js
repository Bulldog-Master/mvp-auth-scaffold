import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const out = document.getElementById('out')
const msg = document.getElementById('msg')
const input = document.getElementById('username')
const insertBtn = document.getElementById('insert')
const fetchBtn  = document.getElementById('fetch')

function setMsg(text, kind = 'info') {
  msg.textContent = text
  msg.style.color = kind === 'error' ? 'crimson' : '#222'
}

function setBusy(busy) {
  insertBtn.disabled = busy
  fetchBtn.disabled = busy
}

insertBtn.onclick = async () => {
  const username = (input.value || '').trim()
  if (!username) {
    setMsg('Please enter a username.', 'error')
    input.focus()
    return
  }

  setBusy(true)
  setMsg('Inserting…')
  try {
    const { data, error } = await supabase
      .from('test_table')
      .insert({ username })
      .select()

    if (error) throw error
    setMsg('Inserted ✔')
    out.textContent = JSON.stringify(data, null, 2)
    input.value = ''
  } catch (err) {
    setMsg(`Insert error: ${err.message}`, 'error')
  } finally {
    setBusy(false)
  }
}

fetchBtn.onclick = async () => {
  setBusy(true)
  setMsg('Fetching…')
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    setMsg('Fetched ✔')
    out.textContent = JSON.stringify(data, null, 2)
  } catch (err) {
    setMsg(`Fetch error: ${err.message}`, 'error')
  } finally {
    setBusy(false)
  }
}