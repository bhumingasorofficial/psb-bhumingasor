
/**
 * BACKEND SYSTEM PSB BHUMI NGASOR (VERSION 4.0 - SECURITY & UX UPDATE)
 */

var SPREADSHEET_ID = "1YJAjnHFP9wnAvSh1LJ53M0nxKTvHDt9j9jWLYAcm1Zs";
var FOLDER_ID = "1gOAPJ1v6eUiWdK0_MuNTrqotHNtJaPyU"; 

// --- UTILS ---

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function generateToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sanitizeArray(input) {
  if (Array.isArray(input)) {
    return input.join(", ");
  }
  return input;
}

function normalizePhone(phone) {
  if (!phone) return "";
  var p = String(phone).replace(/\D/g, "");
  if (p.startsWith("62")) return "0" + p.substring(2);
  if (p.startsWith("0")) return p;
  return p;
}

function uploadFileToDrive(base64Data, mimeType, fileName) {
  if (!base64Data || base64Data.length < 50) return "";
  
  // Security: Server-side MIME validation
  var allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (allowedMimes.indexOf(mimeType) === -1) {
    return "Error: Invalid File Type";
  }

  try {
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return file.getUrl();
  } catch (e) {
    Logger.log("Upload Error: " + e.toString());
    return "Error Upload";
  }
}

function formatAddress(data) {
  var parts = [];
  if (data.specificAddress) parts.push(data.specificAddress);
  if (data.rt && data.rw) parts.push("RT " + data.rt + " / RW " + data.rw);
  if (data.village) parts.push(data.village);
  if (data.district) parts.push(data.district);
  if (data.city) parts.push(data.city);
  if (data.province) parts.push(data.province);
  if (data.postalCode) parts.push(data.postalCode);
  return parts.join(", ");
}

// --- MAIN CONTROLLER ---

function doGet(e) {
  try {
    var action = e.parameter.action;
    var ss = getSpreadsheet();

    if (action === "LOGIN") {
      var params = {
        nik: e.parameter.nik,
        token: e.parameter.token,
        wa: e.parameter.wa // New Security Field
      };
      return handleLogin(ss, params);
    } else if (action === "CHECK_NIK") {
      return handleCheckNik(ss, e.parameter.nik);
    } else if (action === "GET_CONFIG") {
      return handleGetConfig();
    }
    
    return responseJSON({ result: "error", message: "Invalid GET Action" });
  } catch (err) {
    return responseJSON({ result: "error", message: "System Error: " + err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return responseJSON({ result: "error", message: "Server sibuk, silakan coba lagi nanti." });
  }

  try {
    var rawData = JSON.parse(e.postData.contents);
    var action = rawData.action;
    var ss = getSpreadsheet();

    if (action === "REGISTER") {
      return handleRegister(ss, rawData);
    } else if (action === "SUBMIT_FULL") {
      return handleSubmitFull(ss, rawData);
    } else {
      return responseJSON({ result: "error", message: "Aksi tidak dikenal." });
    }

  } catch (err) {
    return responseJSON({ result: "error", message: "Error Sistem: " + err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// --- HANDLERS ---

function handleGetConfig() {
  // Logic Gelombang Server-side
  var month = new Date().getMonth(); // 0 = Jan
  var activeWave = 1;
  
  if (month >= 0 && month <= 2) activeWave = 1;      // Jan - Mar
  else if (month >= 3 && month <= 4) activeWave = 2; // Apr - Mei
  else if (month >= 5 && month <= 6) activeWave = 3; // Jun - Jul
  else activeWave = 3; // Default late

  return responseJSON({
    result: "success",
    config: {
      activeWave: activeWave,
      serverTime: new Date().toString()
    }
  });
}

function handleCheckNik(ss, nik) {
  var sheet = ss.getSheetByName("Registrasi Awal");
  if (!sheet) return responseJSON({ result: "available" }); // Sheet not exists yet means empty

  var inputNik = String(nik).replace(/\D/g, "");
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    var rowNik = String(values[i][5]).replace(/\D/g, ""); 
    if (rowNik === inputNik) {
      return responseJSON({ result: "exists" });
    }
  }
  return responseJSON({ result: "available" });
}

function handleRegister(ss, data) {
  var sheet = getOrCreateSheet(ss, "Registrasi Awal", [
    "Timestamp", "ID Registrasi", "Token", "Sumber Info", 
    "Nama Lengkap", "NIK", "Gender", "No. WA", "Link Bukti Bayar", "Status Verifikasi"
  ]);

  var values = sheet.getDataRange().getValues();
  // Double check NIK on write
  var inputNik = String(data.nik).replace(/\D/g, "");
  for (var i = 1; i < values.length; i++) {
    var existingNik = String(values[i][5]).replace(/\D/g, ""); 
    if (existingNik === inputNik) {
      return responseJSON({ result: "error", message: "NIK sudah terdaftar." });
    }
  }

  var regId = "REG-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyMMddHHmmss");
  var token = generateToken();
  var fileUrl = uploadFileToDrive(data.buktiPembayaranBase64, data.buktiPembayaranMime, "BUKTI_" + data.nik + "_" + data.fullName);

  sheet.appendRow([
    new Date(), 
    regId, 
    "'" + token, 
    sanitizeArray(data.infoSource),
    data.fullName, 
    "'" + data.nik, 
    data.gender, 
    "'" + data.parentWaNumber, 
    fileUrl, 
    "Pending"
  ]);

  return responseJSON({ result: "success", id: regId, message: "Registrasi berhasil." });
}

function handleLogin(ss, data) {
  var sheet = ss.getSheetByName("Registrasi Awal");
  if (!sheet) return responseJSON({ result: "error", message: "Data registrasi tidak ditemukan." });

  var values = sheet.getDataRange().getValues();
  var userFound = null;

  var inputNik = String(data.nik).replace(/\D/g, ""); 
  var inputToken = String(data.token).trim();
  // Clean WA input: user might input 081... or 628...
  var inputWa = normalizePhone(data.wa); 

  for (var i = 1; i < values.length; i++) {
    var rowToken = String(values[i][2]).replace(/^'/, "").trim(); 
    var rowNik = String(values[i][5]).replace(/\D/g, ""); 
    var rowWa = normalizePhone(String(values[i][7]));

    if (rowNik === inputNik && rowToken === inputToken) {
      // 2FA Verification: Check WA Number
      if (inputWa && rowWa !== inputWa) {
        return responseJSON({ result: "error", message: "Nomor WhatsApp tidak cocok dengan data pendaftaran." });
      }

      userFound = {
        regId: values[i][1],
        infoSource: values[i][3],
        fullName: values[i][4],
        nik: rowNik,
        gender: values[i][6],
        parentWaNumber: String(values[i][7]).replace(/^'/, "")
      };
      break;
    }
  }

  if (userFound) {
    // Check if user has already completed Full Registration
    var fullSheet = ss.getSheetByName("Data Pendaftar");
    if (fullSheet) {
      var fullValues = fullSheet.getDataRange().getValues();
      for (var j = 1; j < fullValues.length; j++) {
        var fullNik = String(fullValues[j][7]).replace(/\D/g, ""); 
        if (fullNik === userFound.nik) {
          var row = fullValues[j];
          var completedData = {
             regId: row[1],
             infoSource: row[2],
             schoolChoice: row[3],
             smkMajor: row[4],
             fullName: row[5],
             gender: row[6],
             nik: String(row[7]).replace(/'/g, ""),
             nisn: String(row[8]).replace(/'/g, ""),
             birthPlace: row[9],
             birthDate: String(row[10]).replace(/'/g, ""),
             specificAddress: row[11], 
             previousSchool: row[12],
             parentWaNumber: String(row[13]).replace(/'/g, ""),
             fatherName: row[18],
             motherName: row[22]
          };
          
          return responseJSON({ 
            result: "success", 
            status: "complete", 
            message: "Data lengkap ditemukan.",
            data: completedData
          });
        }
      }
    }
    
    return responseJSON({ result: "success", status: "partial", data: userFound });
  } else {
    return responseJSON({ result: "error", message: "NIK atau Token salah." });
  }
}

function handleSubmitFull(ss, data) {
  var sheet = getOrCreateSheet(ss, "Data Pendaftar", [
    "Timestamp", "ID Registrasi", "Sumber Info", "Jenjang", "Jurusan (SMK)",
    "Nama Lengkap", "Gender", "NIK", "NISN", "Tempat Lahir", "Tanggal Lahir",
    "Alamat Lengkap", "Sekolah Asal", "No. WA",
    "Tinggi (cm)", "Berat (kg)", "Jml Saudara", "Anak Ke-",
    "Nama Ayah", "Pendidikan Ayah", "Pekerjaan Ayah", "Penghasilan Ayah",
    "Nama Ibu", "Pendidikan Ibu", "Pekerjaan Ibu", "Penghasilan Ibu",
    "Nama Wali", "Pendidikan Wali", "Pekerjaan Wali", "Penghasilan Wali",
    "Link KK", "Link Akta", "Link KTP", "Link Foto", "Link Ijazah", 
    "Status Data", "Catatan Admin"
  ]);

  var linkKK = uploadFileToDrive(data.kartuKeluargaBase64, data.kartuKeluargaMime, "KK_" + data.fullName);
  var linkAkta = uploadFileToDrive(data.aktaKelahiranBase64, data.aktaKelahiranMime, "AKTA_" + data.fullName);
  var linkKTP = uploadFileToDrive(data.ktpWalimuridBase64, data.ktpWalimuridMime, "KTP_" + data.fullName);
  var linkFoto = uploadFileToDrive(data.pasFotoBase64, data.pasFotoMime, "FOTO_" + data.fullName);
  var linkIjazah = uploadFileToDrive(data.ijazahBase64, data.ijazahMime, "IJAZAH_" + data.fullName);

  var fullAddress = formatAddress(data);

  sheet.appendRow([
    new Date(), 
    data.regId, 
    sanitizeArray(data.infoSource), // FIX HERE
    data.schoolChoice, 
    data.smkMajor || '-',
    data.fullName, 
    data.gender, 
    "'" + data.nik, 
    "'" + data.nisn, 
    data.birthPlace, 
    "'" + data.birthDate,
    fullAddress, 
    data.previousSchool, 
    "'" + data.parentWaNumber,
    "'" + data.height, 
    "'" + data.weight, 
    "'" + data.siblingCount, 
    "'" + data.childOrder,
    data.fatherName, 
    data.fatherEducation, 
    data.fatherOccupation === 'Lainnya...' ? (data.fatherOccupationOther || 'Lainnya') : data.fatherOccupation, 
    data.fatherIncome,
    data.motherName, 
    data.motherEducation, 
    data.motherOccupation === 'Lainnya...' ? (data.motherOccupationOther || 'Lainnya') : data.motherOccupation, 
    data.motherIncome,
    data.hasGuardian ? data.guardianName : '-', 
    data.hasGuardian ? data.guardianEducation : '-', 
    data.hasGuardian ? (data.guardianOccupation === 'Lainnya...' ? (data.guardianOccupationOther || 'Lainnya') : data.guardianOccupation) : '-', 
    data.hasGuardian ? data.guardianIncome : '-',
    linkKK, linkAkta, linkKTP, linkFoto, linkIjazah,
    "Selesai", 
    "" 
  ]);

  return responseJSON({ result: "success", id: data.regId });
}
