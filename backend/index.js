import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5001;

// ─── SUPABASE INITIALIZATION ──────────────────────────────────────────
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Supabase URL or Key missing in .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());

// ─── STATS ─────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const { data: txs } = await supabase.from('transactions').select('amount');
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: listingCount } = await supabase.from('listings').select('*', { count: 'exact', head: true });

    const totalVolume = txs?.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 0;

    res.json({
      totalVolume,
      userCount: userCount || 0,
      txCount: txs?.length || 0,
      listingCount: listingCount || 0
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── USERS LIST ─────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('lastlogin', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ─── AUTH ───────────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  const { address, name, email } = req.body;
  if (!address) return res.status(400).json({ error: 'Address required' });

  // Try to find user
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('address', address)
    .maybeSingle();

  if (error) {
    console.error("Supabase Select Error:", error);
    return res.status(500).json({ error: error.message });
  }

  if (!user) {
    // New user — insert
    const newUser = {
      address,
      name: name || null,
      email: email || null,
      joinedat: new Date().toISOString(),
      lastlogin: new Date().toISOString()
    };
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([newUser])
      .select()
      .maybeSingle();
    
    if (insertError) {
      console.error("Supabase Insert Error:", insertError);
      return res.status(500).json({ error: insertError.message });
    }
    return res.json({ success: true, user: data, isNew: true });
  } else {
    // Returning user — update
    const updateData = { lastlogin: new Date().toISOString() };
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const { data, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('address', address)
      .select()
      .maybeSingle();

    if (updateError) {
      console.error("Supabase Update Error:", updateError);
      return res.status(500).json({ error: updateError.message });
    }
    return res.json({ success: true, user: data, isNew: false });
  }
});

// ─── TRANSACTIONS ───────────────────────────────────────────────────────
app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('time', { ascending: false })
    .limit(10);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/transactions/:address', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('address', req.params.address)
    .order('time', { ascending: false });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/transactions', async (req, res) => {
  const { address, type, amount, asset, txHash } = req.body;
  if (!address || !amount) return res.status(400).json({ error: 'Incomplete data' });

  // 1. Insert Transaction
  const newTx = {
    address, type,
    amount: Number(amount),
    asset, txhash: txHash,
    time: new Date().toISOString()
  };

  const { data: txData, error: txError } = await supabase
    .from('transactions')
    .insert([newTx])
    .select()
    .maybeSingle();

  if (txError) {
    console.error("Transaction Creation Error:", txError);
    return res.status(500).json({ error: txError.message });
  }

  // 2. Fetch & Update Listing stats
  const { data: listing, error: lError } = await supabase
    .from('listings')
    .select('*')
    .eq('name', asset)
    .maybeSingle();

  if (listing && !lError) {
    const newRaised = (listing.raisedamount || 0) + Number(amount);
    const funded = Math.min(100, Math.round((newRaised / listing.targetamount) * 100));
    const leftover = Math.max(0, listing.targetamount - newRaised);
    const remaining = '₹' + leftover.toLocaleString('en-IN');

    await supabase
      .from('listings')
      .update({ 
        raisedamount: newRaised, 
        funded, 
        remaining 
      })
      .eq('id', listing.id);
  }

  res.json({ success: true, tx: txData, listing: listing || null });
});

// ─── LISTINGS ───────────────────────────────────────────────────────────
app.get('/api/listings', async (req, res) => {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('id', { ascending: true });
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/listings', async (req, res) => {
  const listing = {
    ...req.body,
    funded: 0,
    raisedamount: 0,
    remaining: '₹' + Number(req.body.targetamount || 0).toLocaleString('en-IN')
  };

  const { data, error } = await supabase
    .from('listings')
    .insert([listing])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, listing: data });
});

// ─── AI PROXY (Groq) ────────────────────────────────────────────────────
app.post('/api/ai/chat', async (req, res) => {
  const { messages, model, response_format, temperature, max_tokens } = req.body;
  const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: { 
        message: 'Groq API Key missing on server dashboard.',
        type: 'config_error'
      } 
    });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        messages,
        response_format,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens ?? 1024
      })
    });

    const data = await groqRes.json();
    if (!groqRes.ok) {
        return res.status(groqRes.status).json(data);
    }
    res.json(data);
  } catch (e) {
    console.error('[AI Proxy Error]', e.message);
    res.status(500).json({ 
      error: { 
        message: 'AI Proxy Error: ' + e.message,
        type: 'proxy_error'
      } 
    });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 NestFund Backend: Now Connected to Supabase`);
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

// Export for Vercel Serverless Functions
export default app;
