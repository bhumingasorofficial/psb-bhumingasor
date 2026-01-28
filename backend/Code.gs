
/**
 * BACKEND VERSI DEBUGGING - DENGAN LOGGING LENGKAP
 * 
 * PENTING:
 * 1. Simpan kode ini.
 * 2. Klik "Deploy" -> "New Deployment".
 * 3. Pilih type "Web app".
 * 4. Description: "Versi Debugging".
 * 5. Execute as: "Me".
 * 6. Who has access: "Anyone".
 * 7. Klik "Deploy" dan pastikan URL Web App di React App Anda sesuai.
 */

var SPREADSHEET_ID = "1YJAjnHFP9wnAvSh1LJ53M0nxKTvHDt9j9jWLYAcm1Zs";
var FOLDER_ID = "1gOAPJ1v6eUiWdK0_MuNTrqotHNtJaPyU";
var EMAIL_ADMIN = "bhumingasorofficial@gmail.com"; 
var SECRET_KEY = "0x4AAAAAACU2RP_QZY-6ubAw1mQtm4IYOb4"; 

// --- HELPER: SYSTEM LOGGING ---
// Mencatat error/info ke sheet "System Logs" agar mudah dilacak
function logToSheet(ss, type, message, details) {
  try {
    var logSheet = ss.getSheetByName("System Logs");
    if (!logSheet) {
      logSheet = ss.insertSheet("System Logs");
      logSheet.appendRow(["Timestamp", "Type", "Message", "Details"]);
      logSheet.setFrozenRows(1);
    }
    logSheet.appendRow([new Date(), type, message, details]);
  } catch (e) {
    console.error("Gagal mencatat log: " + e.toString());
  }
}

// --- HELPER: GET DATA SHEET ---
// Memastikan data masuk ke sheet yang benar ("Data Pendaftar")
function getDataSheet(ss) {
  var sheetName = "Data Pendaftar";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    // Header Row (Jika sheet baru dibuat)
    var headers = [
      "Waktu Input", "ID Registrasi", "Sumber Info", "Jenjang", "Jurusan (SMK)",
      "Nama Lengkap", "Gender", "NIK", "NISN", "Tempat Lahir", "Tanggal Lahir",
      "Alamat Lengkap", "Sekolah Asal", "No. WA",
      "Tinggi (cm)", "Berat (kg)", "Jml Saudara", "Anak Ke-",
      "Nama Ayah", "Pendidikan Ayah", "Pekerjaan Ayah", "Penghasilan Ayah",
      "Nama Ibu", "Pendidikan Ibu", "Pekerjaan Ibu", "Penghasilan Ibu",
      "Nama Wali", "Pendidikan Wali", "Pekerjaan Wali", "Penghasilan Wali",
      "Link KK", "Link Akta", "Link KTP", "Link Foto", "Link Ijazah", "Link Bukti Bayar",
      "Status", "Catatan"
    ];
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// --- HELPER: TURNSTILE ---
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

// --- MAIN FUNCTION ---
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  // Open Spreadsheet early for logging
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    // Fatal error: Cannot open spreadsheet
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: "Server Error: Tidak dapat membuka Spreadsheet. Periksa ID Spreadsheet." 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Lock to prevent race conditions
  if (!lock.tryLock(30000)) {
    logToSheet(ss, "ERROR", "Lock Timeout", "Server busy");
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: "Server sedang sibuk, silakan coba lagi dalam beberapa detik." 
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. Validasi Payload
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Data POST kosong");
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      throw new Error("Gagal memparsing JSON: " + parseErr.toString());
    }

    // 2. Cek Aksi Khusus (seperti Cek NIK)
    if (data.action === "CHECK_NIK") {
        var checkSheet = getDataSheet(ss);
        var allData = checkSheet.getDataRange().getValues();
        var nikFound = false;
        // Kolom NIK ada di index 7 (kolom H, array index mulai 0)
        for (var i = 1; i < allData.length; i++) {
            var storedNik = String(allData[i][7] || "").replace(/'/g, "").trim(); 
            if (storedNik === String(data.nik).trim()) {
                nikFound = true;
                break;
            }
        }
        return ContentService.createTextOutput(JSON.stringify({ 
            result: nikFound ? "exists" : "available" 
        })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Log Awal Pendaftaran
    logToSheet(ss, "INFO", "Memulai Pendaftaran", "ID: " + data.regId + ", Nama: " + data.fullName);

    // 4. Verifikasi Turnstile
    if (!verifyTurnstile(data.turnstileToken)) {
       throw new Error("Verifikasi Captcha Gagal");
    }

    // 5. Setup Folder Drive
    var folder;
    try {
      folder = DriveApp.getFolderById(FOLDER_ID);
    } catch (driveErr) {
      throw new Error("Folder Drive tidak ditemukan. Periksa ID Folder.");
    }

    // Fungsi Upload Helper
    function uploadFile(base64Str, mime, name) {
      if (!base64Str || base64Str.length < 50) return ""; 
      try {
        var decoded = Utilities.base64Decode(base64Str);
        var blob = Utilities.newBlob(decoded, mime, name);
        var file = folder.createFile(blob);
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        return file.getUrl();
      } catch (err) { 
        logToSheet(ss, "WARNING", "Gagal Upload File: " + name, err.toString());
        return "Gagal Upload"; 
      }
    }

    // 6. Upload Files
    var linkKK = uploadFile(data.kartuKeluargaBase64, data.kartuKeluargaMime, "KK_" + data.fullName);
    var linkAkta = uploadFile(data.aktaKelahiranBase64, data.aktaKelahiranMime, "AKTA_" + data.fullName);
    var linkKTP = uploadFile(data.ktpWalimuridBase64, data.ktpWalimuridMime, "KTP_" + data.fullName);
    var linkFoto = uploadFile(data.pasFotoBase64, data.pasFotoMime, "FOTO_" + data.fullName);
    var linkIjazah = uploadFile(data.ijazahBase64, data.ijazahMime, "IJAZAH_" + data.fullName);
    var linkBukti = uploadFile(data.buktiPembayaranBase64, data.buktiPembayaranMime, "BUKTI_" + data.fullName);

    // 7. Siapkan Data Row
    var rowData = [
      new Date(),                     
      data.regId,                     
      data.infoSource,                
      data.schoolChoice,              
      data.smkMajor || '-',           
      
      data.fullName,                  
      data.gender,                    
      "'" + data.nik,                 
      "'" + data.nisn,                
      data.birthPlace,                
      "'" + data.birthDate,           
      
      data.address,                   
      data.previousSchool,            
      "'" + data.parentWaNumber,      

      "'" + data.height,              
      "'" + data.weight,              
      "'" + data.siblingCount,        
      "'" + data.childOrder,          
      
      data.fatherName,                
      data.fatherEducation,           
      data.fatherOccupation,          
      data.fatherIncome,              

      data.motherName,                
      data.motherEducation,           
      data.motherOccupation,          
      data.motherIncome,              

      data.hasGuardian ? data.guardianName : '-',       
      data.hasGuardian ? data.guardianEducation : '-',  
      data.hasGuardian ? data.guardianOccupation : '-', 
      data.hasGuardian ? data.guardianIncome : '-',     

      linkKK,
      linkAkta,
      linkKTP,
      linkFoto,
      linkIjazah,
      linkBukti,

      "Pending", 
      ""
    ];

    // 8. Simpan ke Sheet
    var sheet = getDataSheet(ss);
    sheet.appendRow(rowData);
    SpreadsheetApp.flush(); // Paksa simpan segera

    logToSheet(ss, "SUCCESS", "Data Berhasil Disimpan", "Row: " + sheet.getLastRow());

    // 9. Email Notifikasi (Optional, bungkus try-catch agar tidak membatalkan proses utama)
    try {
      MailApp.sendEmail({
        to: EMAIL_ADMIN,
        subject: "Pendaftar Baru: " + data.fullName,
        htmlBody: "<p>Ada pendaftar baru ID: " + data.regId + "</p><p>Cek spreadsheet untuk detail.</p>"
      });
    } catch (e) {
      logToSheet(ss, "WARNING", "Gagal Kirim Email", e.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ result: "success", id: data.regId })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // CATAT ERROR KRITIKAL KE LOG
    logToSheet(ss, "CRITICAL ERROR", error.toString(), e ? e.postData.contents.substring(0, 500) : "No Content");
    
    return ContentService.createTextOutput(JSON.stringify({ 
      result: "error", 
      message: "Terjadi kesalahan sistem: " + error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}
