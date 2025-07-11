import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyietkpayecbkkxsjwvc.supabase.co'
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5aWV0a3BheWVjYmtreHNqd3ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMTMwNzQsImV4cCI6MjA2Nzc4OTA3NH0.RCVx7zfNaoKQZtqhNkUzb4s5C7EwZnVHDhB-Xo3lR94'

// Debug: Check if keys are loaded
console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Key:', supabaseKey ? 'Key loaded' : 'Key missing')

// Test connection safely
if (supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseKey !== 'YOUR_SUPABASE_ANON_KEY') {
  supabase.from('tasks').select('count').then(({ data, error }) => {
    console.log('Supabase connection test:', { data, error })
  }).catch(err => {
    console.log('Supabase connection failed:', err)
  })
} else {
  console.log('Supabase not configured, using localStorage fallback')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export const api = {
  // Auth
  async signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })
    return { data, error }
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Tasks
  async getTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createTask(task) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
    return { data: data?.[0], error }
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
    return { data: data?.[0], error }
  },

  async deleteTask(id) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    return { error }
  },

  // Notes
  async getNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })
    return { data, error }
  },

  async createNote(note) {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
    return { data: data?.[0], error }
  },

  async updateNote(id, content) {
    const { data, error } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', id)
      .select()
    return { data: data?.[0], error }
  },

  async deleteNote(id) {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
    return { error }
  }
}