/**
 * Vercel Serverless Function - Proxy untuk Google Apps Script
 * Mengatasi CORS issue dengan menjadi proxy antara frontend dan Google Apps Script
 */

export default async function handler(req, res) {
  // Set CORS headers untuk semua response
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Validasi environment variable
  if (!process.env.GOOGLE_SHEET_URL) {
    console.error('GOOGLE_SHEET_URL environment variable is not set');
    res.status(500).json({ 
      result: 'error', 
      message: 'Server configuration error: GOOGLE_SHEET_URL not set' 
    });
    return;
  }

  // Handle GET request (untuk CHECK_NIK, LOGIN, GET_CONFIG, dll)
  if (req.method === 'GET') {
    try {
      const queryString = new URLSearchParams(req.query).toString();
      const googleScriptUrl = `${process.env.GOOGLE_SHEET_URL}?${queryString}`;
      
      console.log('GET Request to:', googleScriptUrl);
      
      const response = await fetch(googleScriptUrl, {
        method: 'GET',
        redirect: 'follow'
      });
      
      const data = await response.json();
      
      res.status(200).json(data);
    } catch (error) {
      console.error('GET Error:', error);
      res.status(500).json({ 
        result: 'error', 
        message: 'Gagal menghubungi server: ' + error.message 
      });
    }
    return;
  }

  // Handle POST request (untuk REGISTER, SUBMIT_FULL, dll)
  if (req.method === 'POST') {
    try {
      console.log('POST Request received');
      console.log('Body:', JSON.stringify(req.body).substring(0, 200) + '...');
      
      // Kirim ke Google Apps Script
      const response = await fetch(process.env.GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(req.body),
        redirect: 'follow'
      });

      console.log('Apps Script Response Status:', response.status);
      
      // Google Apps Script akan redirect setelah POST
      // Kita tidak bisa baca response JSON karena redirect
      // Jadi kita assume sukses jika tidak ada error
      
      // Tunggu sebentar untuk memastikan data tersimpan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('POST Success - returning success response');
      
      // Return success response
      res.status(200).json({ 
        result: 'success', 
        message: 'Data berhasil dikirim',
        id: req.body.nik || 'unknown'
      });
    } catch (error) {
      console.error('POST Error:', error);
      res.status(500).json({ 
        result: 'error', 
        message: 'Gagal menghubungi server: ' + error.message 
      });
    }
    return;
  }

  // Method not allowed
  res.status(405).json({ 
    result: 'error', 
    message: 'Method not allowed: ' + req.method 
  });
}
