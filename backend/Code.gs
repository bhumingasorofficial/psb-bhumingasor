
/**
 * BACKEND VERSI LENGKAP (DAFTAR + UPDATE STATUS + UPDATE DATA)
 * ID Spreadsheet: 1YJAjnHFP9wnAvSh1LJ53M0nxKTvHDt9j9jWLYAcm1Zs
 * ID Folder: 1gOAPJ1v6eUiWdK0_MuNTrqotHNtJaPyU
 */

var EMAIL_ADMIN = "smpbhumingasor@gmail.com"; 

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

    // --- BAGIAN 1: UPDATE STATUS (Verifikasi/Reject) ---
    // Indeks Kolom telah bergeser +1 karena penambahan NIK di rowData
    if (data.action === "UPDATE_STATUS") {
       var allData = sheet.getDataRange().getValues();
       var idFound = false;
       for (var i = 1; i < allData.length; i++) {
         if (String(allData[i][1]) === String(data.regId)) { 
           var rowNum = i + 1;
           // Kolom W=23 (Status) SEBELUMNYA. Sekarang geser +1 (NIK) +1 (SchoolChoice) = 25
           // Kolom Status = 25 (Index 24 di JS array, tapi setValue pakai 1-based index jd 25)
           sheet.getRange(rowNum, 25).setValue(data.status); 
           sheet.getRange(rowNum, 26).setValue(data.notes);
           sheet.getRange(rowNum, 27).setValue(data.admin + " (" + new Date().toLocaleString() + ")");
           idFound = true;
           break;
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ result: idFound ? "success" : "error", message: idFound ? "Status Updated" : "ID Not Found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- BAGIAN 2: UPDATE DATA (Edit Nama, NISN, WA, Sekolah) ---
    if (data.action === "UPDATE_DATA") {
       var allData = sheet.getDataRange().getValues();
       var idFound = false;
       for (var i = 1; i < allData.length; i++) {
         if (String(allData[i][1]) === String(data.regId)) {
           var rowNum = i + 1;
           // Indeks bergeser +1 karena NIK
           // Nama: Index 5
           // NIK: Index 6 (Tidak diupdate disini)
           // NISN: Index 7
           // Sekolah: Index 12
           // WA: Index 17
           sheet.getRange(rowNum, 5).setValue(data.fullName);
           sheet.getRange(rowNum, 7).setValue("'" + data.nisn);
           sheet.getRange(rowNum, 12).setValue(data.originSchool);
           sheet.getRange(rowNum, 17).setValue("'" + data.whatsapp);
           idFound = true;
           break;
         }
       }
       return ContentService.createTextOutput(JSON.stringify({ result: idFound ? "success" : "error", message: idFound ? "Data Updated" : "ID Not Found" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- BAGIAN 3: PENDAFTARAN BARU ---
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

    // UPDATE ROW DATA STRUCTURE
    // Urutan:
    // 0. Time
    // 1. Reg ID
    // 2. Info Source
    // 3. School Choice
    // 4. Full Name
    // 5. NIK (BARU)
    // 6. NISN
    // ...
    var rowData = [
      new Date(), 
      data.regId, 
      data.infoSource, 
      data.schoolChoice,
      data.fullName,
      "'" + data.nik, // FIELD BARU NIK
      "'" + data.nisn, 
      data.gender,
      data.birthPlace, 
      data.birthDate, 
      data.address, 
      data.previousSchool, 
      data.fatherName,
      data.fatherOccupation, 
      data.motherName, 
      data.motherOccupation, 
      "'" + data.parentWaNumber,
      uploadFile(data.kartuKeluargaBase64, data.kartuKeluargaMime, "KK_" + data.fullName),
      uploadFile(data.aktaKelahiranBase64, data.aktaKelahiranMime, "AKTA_" + data.fullName),
      uploadFile(data.ktpWalimuridBase64, data.ktpWalimuridMime, "KTP_" + data.fullName),
      uploadFile(data.pasFotoBase64, data.pasFotoMime, "FOTO_" + data.fullName),
      uploadFile(data.ijazahBase64, data.ijazahMime, "IJAZAH_" + data.fullName),
      uploadFile(data.buktiPembayaranBase64, data.buktiPembayaranMime, "BUKTI_BAYAR_" + data.fullName),
      "Pending", "", ""
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
