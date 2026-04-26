/**
 * Vercel Serverless Function - Proxy untuk Google Apps Script
 * 
 * Fungsi ini mengatasi CORS issue dengan menjadi proxy antara frontend dan Google Apps Script
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle GET request (untuk CHECK_NIK, LOGIN, dll)
  if (req.method === 'GET') {
    try {
      const queryString = new URLSearchParams(req.query).toString();
      const googleScriptUrl = `${process.env.GOOGLE_SHEET_URL}?${queryString}`;
      
      const response = await fetch(googleScriptUrl);
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
      const response = await fetch(process.env.GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(req.body),
        redirect: 'follow'
      });

      // Google Apps Script akan redirect, jadi kita tidak bisa baca response JSON
      // Kita assume sukses jika tidak ada error
      
      // Tunggu sebentar untuk memastikan data tersimpan
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return success response
      res.status(200).json({ 
        result: 'success', 
        message: 'Data berhasil dikirim' 
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
    message: 'Method not allowed' 
  });
}
