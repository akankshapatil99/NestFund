import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import morgan from 'morgan';

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

// ─── PRODUCTION MONITORING & LOGGING ────────────────────────────────────
// Use 'combined' format for detailed Apache-style logs in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Custom error logging middleware
const errorLogger = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.error(err.stack);
  next(err);
};
app.use(errorLogger);

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

// ─── METRICS DASHBOARD ──────────────────────────────────────────────────
app.get('/api/metrics', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0,0,0,0);
    const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate() - 30);

    // DAU — users who logged in today
    const { count: dau } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('lastlogin', todayStart.toISOString());

    // WAU — users active in last 7 days
    const { count: wau } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('lastlogin', weekAgo.toISOString());

    // Total users
    const { count: totalUsers } = await supabase
      .from('users').select('*', { count: 'exact', head: true });

    // New users today
    const { count: newUsersToday } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('joinedat', todayStart.toISOString());

    // New users this week
    const { count: newUsersWeek } = await supabase
      .from('users').select('*', { count: 'exact', head: true })
      .gte('joinedat', weekAgo.toISOString());

    // All transactions for volume + count
    const { data: allTxs } = await supabase
      .from('transactions').select('amount, time, address, asset, type')
      .order('time', { ascending: false });

    const totalVolume = allTxs?.reduce((s, t) => s + (Number(t.amount) || 0), 0) || 0;

    // Transactions today
    const txsToday = allTxs?.filter(t => new Date(t.time) >= todayStart) || [];
    const txsWeek  = allTxs?.filter(t => new Date(t.time) >= weekAgo) || [];

    // User growth — last 7 days bucketed by day
    const { data: recentUsers } = await supabase
      .from('users').select('joinedat')
      .gte('joinedat', weekAgo.toISOString());

    const growthByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      growthByDay[label] = 0;
    }
    (recentUsers || []).forEach(u => {
      const d = new Date(u.joinedat);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      if (growthByDay[label] !== undefined) growthByDay[label]++;
    });

    // Tx volume — last 7 days bucketed by day
    const txByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      txByDay[label] = 0;
    }
    (txsWeek || []).forEach(t => {
      const d = new Date(t.time);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
      if (txByDay[label] !== undefined) txByDay[label] += Number(t.amount) || 0;
    });

    // Retention rate = returning users (logins > joins) / total
    const { data: returningData } = await supabase
      .from('users').select('joinedat, lastlogin');
    const returning = (returningData || []).filter(u => {
      if (!u.joinedat || !u.lastlogin) return false;
      return new Date(u.lastlogin) - new Date(u.joinedat) > 60 * 60 * 1000; // came back 1hr+ later
    });
    const retentionRate = totalUsers > 0 ? Math.round((returning.length / totalUsers) * 100) : 0;

    res.json({
      dau: dau || 0,
      wau: wau || 0,
      totalUsers: totalUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersWeek: newUsersWeek || 0,
      totalVolume,
      txCountToday: txsToday.length,
      txCountWeek: txsWeek.length,
      txCountTotal: allTxs?.length || 0,
      retentionRate,
      growthByDay,
      txByDay,
      recentTxs: (allTxs || []).slice(0, 8)
    });
  } catch (e) {
    console.error('[Metrics Error]', e);
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
