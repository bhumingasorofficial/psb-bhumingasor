
/**
 * BACKEND VERSI LENGKAP - UPDATED UNTUK FORMULIR 2026/2027
 * ID Spreadsheet: 1YJAjnHFP9wnAvSh1LJ53M0nxKTvHDt9j9jWLYAcm1Zs
 * ID Folder: 1gOAPJ1v6eUiWdK0_MuNTrqotHNtJaPyU
 */

var EMAIL_ADMIN = "bhumingasorofficial@gmail.com"; 
var SECRET_KEY = "0x4AAAAAACU2RP_QZY-6ubAw1mQtm4IYOb4"; 

// Fungsi Verifikasi Turnstile
function verifyTurnstile(token) {
  if (!token) return false;
  var url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  var payload = {
    'secret': SECRET_KEY,
    'response': token
  };
  var options = {
    'method': 'post',
    'payload': payload
  };
  try {
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    return json.success;
  } catch (e) {
    return false;
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000); 

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Data Kosong atau Format Salah");
    }

    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.openById("1YJAjnHFP9wnAvSh1LJ53M0nxKTvHDt9j9jWLYAcm1Zs");
    var sheet = ss.getSheets()[0];

    // --- BAGIAN 0: CHECK DUPLIKAT NIK (UPDATED INDEX) ---
    if (data.action === "CHECK_NIK") {
        var allData = sheet.getDataRange().getValues();
        var nikFound = false;
        var existingName = "";
        
        // NIK kini ada di Kolom 8 (Index 7) karena ada tambahan Jurusan
        // Struktur Baru (perkiraan):
        // 0: Time, 1: ID, 2: Info, 3: School, 4: Major, 5: Nama, 6: Gender, 7: NIK, 8: NISN...
        
        for (var i = 1; i < allData.length; i++) {
            var storedNik = String(allData[i][7]).replace(/'/g, "").trim(); // Adjust index based on rowData below
            if (storedNik === String(data.nik).trim()) {
                nikFound = true;
                existingName = allData[i][5]; 
                break;
            }
        }
        
        return ContentService.createTextOutput(JSON.stringify({ 
            result: nikFound ? "exists" : "available", 
            message: nikFound ? "NIK sudah terdaftar atas nama " + existingName : "NIK tersedia"
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- BAGIAN 3: PENDAFTARAN BARU ---
    
    // VERIFIKASI TOKEN TURNSTILE
    if (!verifyTurnstile(data.turnstileToken)) {
       throw new Error("Verifikasi Keamanan Gagal. Silahkan muat ulang.");
    }

    var folder = DriveApp.getFolderById("1gOAPJ1v6eUiWdK0_MuNTrqotHNtJaPyU");
    function uploadFile(base64Str, mime, name) {
      if (!base64Str || base64Str.length < 50) return ""; 
      try {
        var decoded = Utilities.base64Decode(base64Str);
        var blob = Utilities.newBlob(decoded, mime, name);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) { return "Error Upload: " + err.toString(); }
    }

    // UPDATE ROW DATA STRUCTURE 2026/2027
    // Menyesuaikan dengan format yang diminta user
    var rowData = [
      new Date(),                     // 0. Timestamp
      data.regId,                     // 1. ID
      data.infoSource,                // 2. Info
      data.schoolChoice,              // 3. Sekolah
      data.smkMajor || '-',           // 4. Jurusan (New)
      
      // A. Identitas
      data.fullName,                  // 5. Nama
      data.gender,                    // 6. JK
      "'" + data.nik,                 // 7. NIK
      "'" + data.nisn,                // 8. NISN
      data.birthPlace,                // 9. Tempat Lahir
      "'" + data.birthDate,           // 10. Tgl Lahir
      
      // B. Alamat & C. Kontak
      data.address,                   // 11. Alamat Lengkap
      data.previousSchool,            // 12. Asal Sekolah
      "'" + data.parentWaNumber,      // 13. WA Utama

      // F. Data Periodik (New)
      "'" + data.height,              // 14
      "'" + data.weight,              // 15
      "'" + data.siblingCount,        // 16
      "'" + data.childOrder,          // 17
      
      // E. Orang Tua
      // Ayah
      data.fatherName,                // 18
      data.fatherEducation,           // 19 (New)
      data.fatherOccupation,          // 20
      data.fatherIncome,              // 21 (New)

      // Ibu
      data.motherName,                // 22
      data.motherEducation,           // 23 (New)
      data.motherOccupation,          // 24
      data.motherIncome,              // 25 (New)

      // Wali (New Section)
      data.hasGuardian ? data.guardianName : '-',       // 26
      data.hasGuardian ? data.guardianEducation : '-',  // 27
      data.hasGuardian ? data.guardianOccupation : '-', // 28
      data.hasGuardian ? data.guardianIncome : '-',     // 29

      // Files
      uploadFile(data.kartuKeluargaBase64, data.kartuKeluargaMime, "KK_" + data.fullName),     // 30
      uploadFile(data.aktaKelahiranBase64, data.aktaKelahiranMime, "AKTA_" + data.fullName),   // 31
      uploadFile(data.ktpWalimuridBase64, data.ktpWalimuridMime, "KTP_" + data.fullName),      // 32
      uploadFile(data.pasFotoBase64, data.pasFotoMime, "FOTO_" + data.fullName),               // 33
      uploadFile(data.ijazahBase64, data.ijazahMime, "IJAZAH_" + data.fullName),               // 34
      uploadFile(data.buktiPembayaranBase64, data.buktiPembayaranMime, "BUKTI_BAYAR_" + data.fullName), // 35

      "Pending", // 36 Status
      "",        // 37 Notes
      ""         // 38 Admin Log
    ];
    
    sheet.appendRow(rowData);

    // Email Notifikasi
    try {
      MailApp.sendEmail({
        to: EMAIL_ADMIN,
        subject: "Pendaftar Baru (" + data.schoolChoice + "): " + data.fullName,
        htmlBody: "<h3>Pendaftar Baru Masuk</h3><p>Jenjang: <strong>" + data.schoolChoice + "</strong><br>Nama: " + data.fullName + "<br>ID: " + data.regId + "</p>"
      });
    } catch (e) {}

    return ContentService.createTextOutput(JSON.stringify({ result: "success", id: data.regId })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
