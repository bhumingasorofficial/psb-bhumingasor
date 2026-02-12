
/**
 * BACKEND SYSTEM PSB BHUMI NGASOR (VERSION 7.3 - FILE NAMING FIX)
 * - Fixed: File Naming Convention (Type_Name_Level)
 * - Helper: getExtension for proper file types
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

function normalizePhone(phone) {
  if (!phone) return "";
  var p = String(phone).replace(/\D/g, "");
  if (p.startsWith("62")) return "0" + p.substring(2);
  if (p.startsWith("0")) return p;
  return p;
}

// --- HELPER: GET EXTENSION ---
function getExtension(mimeType) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'application/pdf') return '.pdf';
  return '';
}

// --- HELPER: SANITIZE FILENAME ---
function sanitizeFilename(str) {
  if (!str) return "";
  return str.replace(/[^a-zA-Z0-9 ]/g, "").trim();
}

// --- HELPER: UPLOAD FILE ---
function uploadFileToDrive(base64Data, mimeType, fileName, folderId) {
  try {
    if (!base64Data) return "-";
    
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, fileName);
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (e) {
    Logger.log("Upload Error: " + e.toString());
    return "ERROR_UPLOAD";
  }
}

function logActivity(ss, actor, action, targetId, details) {
  try {
    var sheet = getOrCreateSheet(ss, "Log Aktivitas", ["Timestamp", "User/Actor", "Action", "Target ID", "Details"]);
    sheet.appendRow([new Date(), actor, action, targetId, details]);
  } catch (e) {
    Logger.log("Audit Log Error: " + e.toString());
  }
}

// --- MAIN CONTROLLER ---

function doGet(e) {
  try {
    var action = e.parameter.action;
    var ss = getSpreadsheet();

    if (action === "GET_STATS") {
      return handleGetStats(ss, e.parameter.role);
    } else if (action === "GET_APPLICANTS") {
      return handleGetApplicants(ss, e.parameter);
    } else if (action === "GET_LOGS") {
       return handleGetLogs(ss, e.parameter.role);
    } else if (action === "LOGIN") { 
      var params = {
        nik: e.parameter.nik,
        token: e.parameter.token,
        wa: e.parameter.wa
      };
      return handleLoginStudent(ss, params);
    } else if (action === "CHECK_NIK") {
      return handleCheckNik(ss, e.parameter.nik);
    } else if (action === "GET_CONFIG") {
      return handleGetConfig();
    }
    
    return responseJSON({ result: "error", message: "Invalid GET Action: " + action });
  } catch (err) {
    return responseJSON({ result: "error", message: "System Error: " + err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) { 
    return responseJSON({ result: "error", message: "Server sibuk, silakan coba lagi." });
  }

  try {
    var rawData = JSON.parse(e.postData.contents);
    var action = rawData.action;
    var ss = getSpreadsheet();

    if (action === "ADMIN_LOGIN") {
      return handleAdminLogin(ss, rawData.username, rawData.password);
    } else if (action === "REGISTER") {
      return handleRegister(ss, rawData);
    } else if (action === "SUBMIT_FULL") {
      return handleSubmitFull(ss, rawData);
    } else if (action === "UPDATE_STATUS") { 
      return handleUpdateStatus(ss, rawData);
    } else if (action === "UPDATE_DATA") {
      return handleUpdateData(ss, rawData);
    } else if (action === "BULK_UPDATE_STATUS") {
      return handleBulkUpdateStatus(ss, rawData);
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
  var month = new Date().getMonth(); 
  var activeWave = 1;
  if (month >= 0 && month <= 2) activeWave = 1;      
  else if (month >= 3 && month <= 4) activeWave = 2; 
  else if (month >= 5 && month <= 6) activeWave = 3; 
  else activeWave = 3; 

  return responseJSON({
    result: "success",
    config: { activeWave: activeWave }
  });
}

function handleLoginStudent(ss, data) {
  var sheet = ss.getSheetByName("Registrasi Awal");
  if (!sheet) return responseJSON({ result: "error", message: "Data registrasi tidak ditemukan." });

  var values = sheet.getDataRange().getValues();
  var userFound = null;

  var inputNik = String(data.nik).replace(/\D/g, ""); 
  var inputToken = String(data.token).trim();
  var inputWa = normalizePhone(data.wa); 

  for (var i = 1; i < values.length; i++) {
    var rowToken = String(values[i][2]).replace(/^'/, "").trim(); 
    var rowNik = String(values[i][5]).replace(/\D/g, ""); 
    var rowWa = normalizePhone(String(values[i][7]));

    if (rowNik === inputNik && rowToken === inputToken) {
      if (inputWa && rowWa !== inputWa) {
        return responseJSON({ result: "error", message: "Nomor WhatsApp tidak cocok dengan data pendaftaran." });
      }

      userFound = {
        regId: values[i][1],
        infoSource: String(values[i][3]),
        fullName: values[i][4],
        nik: rowNik,
        gender: values[i][6],
        parentWaNumber: String(values[i][7]).replace(/^'/, "")
      };
      break;
    }
  }

  if (userFound) {
    var fullSheet = ss.getSheetByName("Data Pendaftar");
    if (fullSheet) {
      var fullValues = fullSheet.getDataRange().getValues();
      for (var j = 1; j < fullValues.length; j++) {
        var fullNik = String(fullValues[j][7]).replace(/\D/g, ""); 
        if (fullNik === userFound.nik) {
          var row = fullValues[j];
          var completedData = {
             regId: row[1],
             infoSource: String(row[2]),
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
             fatherEducation: row[19],
             fatherOccupation: row[20],
             fatherIncome: row[21],
             motherName: row[22],
             motherEducation: row[23],
             motherOccupation: row[24],
             motherIncome: row[25],
             hasGuardian: row[26] && row[26] !== '-' ? true : false,
             guardianName: row[26] === '-' ? '' : row[26],
             guardianEducation: row[27] === '-' ? '' : row[27],
             guardianOccupation: row[28] === '-' ? '' : row[28],
             guardianIncome: row[29] === '-' ? '' : row[29]
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

function handleCheckNik(ss, nik) {
  var sheet = ss.getSheetByName("Registrasi Awal");
  if (!sheet) return responseJSON({ result: "available" });
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

  var regId = "REG-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyMMddHHmmss");
  var token = generateToken();
  
  // FIX: UPLOAD FILE KE DRIVE DENGAN FORMAT NAMA BARU
  var fileUrl = "DRIVE_FILE_PENDING";
  if (data.buktiPembayaranBase64) {
      var ext = getExtension(data.buktiPembayaranMime);
      var safeName = sanitizeFilename(data.fullName);
      // Format: BUKTI_BAYAR_NamaSantri (Jenjang belum ada di tahap ini)
      var fileName = "BUKTI_BAYAR_" + safeName + ext;
      fileUrl = uploadFileToDrive(data.buktiPembayaranBase64, data.buktiPembayaranMime, fileName, FOLDER_ID);
  }

  sheet.appendRow([
    new Date(), 
    regId, 
    "'" + token, 
    (data.infoSource||[]).join(','),
    data.fullName, 
    "'" + data.nik, 
    data.gender, 
    "'" + data.parentWaNumber, 
    fileUrl, 
    "Pending"
  ]);

  return responseJSON({ result: "success", id: regId });
}

function handleSubmitFull(ss, data) {
    try {
        var sheet = getOrCreateSheet(ss, "Data Pendaftar", [
            "Timestamp", "ID Registrasi", "Sumber Info", "Jenjang", "Jurusan (SMK)", 
            "Nama Lengkap", "Gender", "NIK", "NISN", "Tempat Lahir", "Tanggal Lahir",
            "Alamat Lengkap", "Sekolah Asal", "No. WA", "Tinggi", "Berat", "Jml Saudara", "Anak Ke",
            "Nama Ayah", "Pend. Ayah", "Pek. Ayah", "Penghasilan Ayah",
            "Nama Ibu", "Pend. Ibu", "Pek. Ibu", "Penghasilan Ibu",
            "Nama Wali", "Pend. Wali", "Pek. Wali", "Penghasilan Wali",
            "Link KK", "Link Akta", "Link KTP", "Link Foto", "Link Ijazah",
            "Status Data", "Catatan Admin", "Diverifikasi Oleh"
        ]);

        // PREPARE FILE NAMES: (Jenis)_Nama Santri_Jenjang
        var safeName = sanitizeFilename(data.fullName);
        var safeJenjang = sanitizeFilename(data.schoolChoice);

        var kkName = "KK_" + safeName + "_" + safeJenjang + getExtension(data.kartuKeluargaMime);
        var aktaName = "AKTA_" + safeName + "_" + safeJenjang + getExtension(data.aktaKelahiranMime);
        var ktpName = "KTP_ORTU_" + safeName + "_" + safeJenjang + getExtension(data.ktpWalimuridMime);
        var fotoName = "FOTO_" + safeName + "_" + safeJenjang + getExtension(data.pasFotoMime);
        var ijazahName = "IJAZAH_" + safeName + "_" + safeJenjang + getExtension(data.ijazahMime);

        // Upload Dokumen Pendukung
        var kkUrl = uploadFileToDrive(data.kartuKeluargaBase64, data.kartuKeluargaMime, kkName, FOLDER_ID);
        var aktaUrl = uploadFileToDrive(data.aktaKelahiranBase64, data.aktaKelahiranMime, aktaName, FOLDER_ID);
        var ktpUrl = uploadFileToDrive(data.ktpWalimuridBase64, data.ktpWalimuridMime, ktpName, FOLDER_ID);
        var fotoUrl = uploadFileToDrive(data.pasFotoBase64, data.pasFotoMime, fotoName, FOLDER_ID);
        var ijazahUrl = uploadFileToDrive(data.ijazahBase64, data.ijazahMime, ijazahName, FOLDER_ID);

        // Format Alamat Lengkap
        var fullAddress = (data.specificAddress || "") + ", RT " + (data.rt || "") + "/RW " + (data.rw || "") + 
                          ", Ds. " + (data.village || "") + ", Kec. " + (data.district || "") + 
                          ", " + (data.city || "") + ", " + (data.province || "") + " (" + (data.postalCode || "") + ")";

        var jobAyah = data.fatherOccupation === "Lainnya..." ? data.fatherOccupationOther : data.fatherOccupation;
        var jobIbu = data.motherOccupation === "Lainnya..." ? data.motherOccupationOther : data.motherOccupation;
        var jobWali = data.hasGuardian ? (data.guardianOccupation === "Lainnya..." ? data.guardianOccupationOther : data.guardianOccupation) : "-";

        var rowData = [
            new Date(),
            data.regId,
            (data.infoSource || []).join(','),
            data.schoolChoice,
            data.smkMajor || "-",
            data.fullName,
            data.gender,
            "'" + data.nik,
            "'" + (data.nisn || "-"),
            data.birthPlace,
            "'" + data.birthDate,
            fullAddress,
            data.previousSchool,
            "'" + data.parentWaNumber,
            data.height,
            data.weight,
            data.siblingCount,
            data.childOrder,
            data.fatherName,
            data.fatherEducation,
            jobAyah,
            data.fatherIncome,
            data.motherName,
            data.motherEducation,
            jobIbu,
            data.motherIncome,
            data.hasGuardian ? data.guardianName : "-",
            data.hasGuardian ? data.guardianEducation : "-",
            jobWali,
            data.hasGuardian ? data.guardianIncome : "-",
            kkUrl,
            aktaUrl,
            ktpUrl,
            fotoUrl,
            ijazahUrl,
            "Pending Verifikasi", 
            "-", 
            "-" 
        ];

        sheet.appendRow(rowData);
        
        return responseJSON({ result: "success", id: data.regId });
    } catch (e) {
        return responseJSON({ result: "error", message: "Gagal menyimpan data lengkap: " + e.toString() });
    }
}

function handleAdminLogin(ss, username, password) {
  var sheet = ss.getSheetByName("Akun");
  if (!sheet) return responseJSON({ result: "error", message: "Database akun tidak ditemukan." });

  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    var u = String(values[i][0]).trim();
    var p = String(values[i][1]).trim();
    var r = String(values[i][2]).trim();

    if (u === username && p === password) {
      logActivity(ss, username, "LOGIN", "-", "User logged in successfully");
      return responseJSON({ result: "success", role: r });
    }
  }
  return responseJSON({ result: "error", message: "Username atau password salah." });
}

function handleGetStats(ss, role) {
  var sheet = ss.getSheetByName("Data Pendaftar");
  if (!sheet) return responseJSON({ result: "success", stats: {} });

  var rows = sheet.getDataRange().getValues();
  var roleLower = (role || '').toLowerCase();
  
  var stats = {
    total: 0, today: 0, pending: 0, needFix: 0, verified: 0, incompleteDocs: 0,
    genderStats: { putra: 0, putri: 0 },
    eduStats: { mi: 0, smp: 0, smk: 0, kuliah: 0, salaf: 0 },
    schoolCounts: {},
    surveyCounts: {},
    trendCounts: {}
  };
  
  var todayStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var program = String(row[3]).toLowerCase();
    var gender = String(row[6]);
    var status = String(row[35]);
    var timestamp = row[0] ? new Date(row[0]) : new Date();
    var dateStr = Utilities.formatDate(timestamp, "Asia/Jakarta", "yyyy-MM-dd");
    var school = String(row[12]);
    var source = String(row[2]);
    
    var shouldInclude = checkAccess(roleLower, program, gender);
    
    if (shouldInclude) {
      stats.total++;
      if (dateStr === todayStr) stats.today++;
      
      if (status.includes('Verified')) stats.verified++;
      else if (status.includes('Need Fix')) stats.needFix++;
      else if (status.includes('Pending') || status === '') stats.pending++;

      if (!row[30] || !row[31] || !row[32] || !row[33]) stats.incompleteDocs++;

      if (gender === 'Laki-laki') stats.genderStats.putra++;
      else if (gender === 'Perempuan') stats.genderStats.putri++;

      if (/\b(mi|sd|ibtidaiyah)\b/i.test(program)) stats.eduStats.mi++;
      else if (/\b(smp|mts|menengah)\b/i.test(program)) stats.eduStats.smp++;
      else if (/\b(smk|sma|ma|aliyah)\b/i.test(program)) stats.eduStats.smk++;
      else if (/\b(kuliah|mahasiswa)\b/i.test(program)) stats.eduStats.kuliah++;
      else stats.eduStats.salaf++;

      stats.schoolCounts[school] = (stats.schoolCounts[school] || 0) + 1;
      stats.surveyCounts[source] = (stats.surveyCounts[source] || 0) + 1;
      stats.trendCounts[dateStr] = (stats.trendCounts[dateStr] || 0) + 1;
    }
  }

  var initData = [];
  if (roleLower.includes('administrasi full')) {
      var sheetInit = ss.getSheetByName("Registrasi Awal");
      if (sheetInit) {
          var rowsInit = sheetInit.getDataRange().getValues();
          for(var j=1; j<rowsInit.length; j++) {
              var rInit = rowsInit[j];
              if(checkAccess(roleLower, '', rInit[6])) { 
                  initData.push({
                      timestamp: rInit[0],
                      id: rInit[1],
                      token: String(rInit[2]).replace(/'/g, ''),
                      infoSource: String(rInit[3]),
                      fullName: rInit[4],
                      nik: String(rInit[5]).replace(/'/g, ''),
                      gender: rInit[6],
                      whatsapp: String(rInit[7]).replace(/'/g, ''),
                      paymentProof: rInit[8],
                      verificationStatus: rInit[9]
                  });
              }
          }
      }
  }

  return responseJSON({
    result: "success",
    stats: {
      ...stats,
      schoolStats: objToSortedArray(stats.schoolCounts, 10),
      surveyStats: objToSortedArray(stats.surveyCounts, 100),
      trendStats: trendMapToArray(stats.trendCounts)
    },
    initialData: initData
  });
}

function handleGetApplicants(ss, params) {
  var sheet = ss.getSheetByName("Data Pendaftar");
  if (!sheet) return responseJSON({ result: "success", data: [], total: 0 });

  var roleLower = (params.role || '').toLowerCase();
  var page = parseInt(params.page) || 1;
  var limit = parseInt(params.limit) || 20;
  var search = (params.search || '').toLowerCase();
  var statusFilter = params.status || 'All';
  var dateStart = params.startDate ? new Date(params.startDate).getTime() : 0;
  var dateEnd = params.endDate ? new Date(params.endDate).getTime() + 86400000 : 9999999999999;

  var rows = sheet.getDataRange().getValues();
  var filtered = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var program = String(row[3]).toLowerCase();
    var gender = String(row[6]);
    
    if (!checkAccess(roleLower, program, gender)) continue;

    var searchable = (String(row[1]) + " " + String(row[5]) + " " + String(row[8]) + " " + String(row[13])).toLowerCase();
    if (search && !searchable.includes(search)) continue;

    var status = String(row[35]);
    if (statusFilter !== 'All') {
        if (statusFilter === 'Incomplete') {
             if (row[30] && row[31] && row[32] && row[33]) continue;
        } else if (status !== statusFilter) {
             continue;
        }
    }

    var ts = row[0] ? new Date(row[0]).getTime() : 0;
    if (ts < dateStart || ts > dateEnd) continue;

    filtered.push(mapRowToApplicant(row));
  }

  filtered.sort(function(a, b) { return new Date(b.timestamp) - new Date(a.timestamp); });

  var total = filtered.length;
  var totalPages = Math.ceil(total / limit);
  var offset = (page - 1) * limit;
  var pagedData = filtered.slice(offset, offset + limit);

  return responseJSON({
    result: "success",
    data: pagedData,
    total: total,
    page: page,
    totalPages: totalPages
  });
}

function handleGetLogs(ss, role) {
    if ((role||'').toLowerCase() !== 'akses administrasi full') return responseJSON({logs: []});
    var sheet = ss.getSheetByName("Log Aktivitas");
    var logs = [];
    if(sheet) {
        var vals = sheet.getDataRange().getValues();
        for(var i=1; i<vals.length; i++) {
            logs.push({
                timestamp: vals[i][0],
                actor: vals[i][1],
                action: vals[i][2],
                targetId: vals[i][3],
                details: vals[i][4]
            });
        }
    }
    return responseJSON({ result: "success", logs: logs.reverse().slice(0, 100) });
}

function handleBulkUpdateStatus(ss, data) {
  var sheet = ss.getSheetByName("Data Pendaftar");
  if (!sheet) return responseJSON({ result: "error", message: "Sheet tidak ditemukan" });

  var ids = data.ids; 
  var status = data.status;
  var adminName = data.adminName;
  var notes = data.notes || "";
  
  if (!ids || ids.length === 0) return responseJSON({ result: "error", message: "No IDs provided" });

  var rows = sheet.getDataRange().getValues();
  var idMap = {};
  for (var i = 1; i < rows.length; i++) {
    idMap[String(rows[i][1]).trim()] = i + 1; 
  }

  var statusRanges = [];
  var verifierRanges = [];
  var notesRanges = [];

  var colStatus = 36; 
  var colNotes = 37;
  var colVerifier = 38;

  var updatedCount = 0;
  ids.forEach(function(id) {
    var rowIndex = idMap[id];
    if (rowIndex) {
      statusRanges.push(sheet.getRange(rowIndex, colStatus).getA1Notation());
      verifierRanges.push(sheet.getRange(rowIndex, colVerifier).getA1Notation());
      if(notes) notesRanges.push(sheet.getRange(rowIndex, colNotes).getA1Notation());
      updatedCount++;
    }
  });

  if (statusRanges.length > 0) sheet.getRangeList(statusRanges).setValue(status);
  if (verifierRanges.length > 0) sheet.getRangeList(verifierRanges).setValue(adminName);
  if (notesRanges.length > 0) sheet.getRangeList(notesRanges).setValue(notes);

  logActivity(ss, adminName, "BULK_UPDATE", ids.length + " Items", "Status to: " + status);

  return responseJSON({ result: "success", updatedCount: updatedCount });
}

// --- HELPER FUNCTIONS ---

function checkAccess(role, program, gender) {
  if (role.includes('administrasi full') || role.includes('pengasuh')) {
    if (role.includes('santri putra') && gender !== 'Laki-laki') return false;
    if (role.includes('santri putri') && gender !== 'Perempuan') return false;
    return true;
  }
  if (role.includes('mi') && /\b(mi|sd|ibtidaiyah)\b/i.test(program)) return true;
  if (role.includes('smp') && /\b(smp|mts|menengah)\b/i.test(program)) return true;
  if (role.includes('smk') && /\b(smk|sma|ma|aliyah)\b/i.test(program)) return true;
  if (role.includes('kuliah') && /\b(kuliah|mahasiswa)\b/i.test(program)) return true;
  if (role.includes('salaf') && program.includes('salaf')) return true;
  return false;
}

function mapRowToApplicant(row) {
  return {
    timestamp: row[0],
    id: row[1],
    surveySource: row[2],
    program: row[3],
    major: row[4],
    fullName: row[5],
    gender: row[6],
    nik: String(row[7]).replace(/'/g, ''),
    nisn: String(row[8]).replace(/'/g, ''),
    birthPlace: row[9],
    birthDate: String(row[10]).replace(/'/g, ''),
    address: row[11],
    originSchool: row[12],
    whatsapp: String(row[13]).replace(/'/g, ''),
    height: row[14],
    weight: row[15],
    siblingCount: row[16],
    childOrder: row[17],
    fatherName: row[18],
    fatherEducation: row[19],
    fatherJob: row[20],
    fatherIncome: row[21],
    motherName: row[22],
    motherEducation: row[23],
    motherJob: row[24],
    motherIncome: row[25],
    guardianName: row[26],
    guardianEducation: row[27],
    guardianJob: row[28],
    guardianIncome: row[29],
    docKK: row[30],
    docAkta: row[31],
    docKTP: row[32],
    docPhoto: row[33],
    docIjazah: row[34],
    status: row[35],
    notes: row[36],
    verifiedBy: row[37]
  };
}

function objToSortedArray(obj, limit) {
  var arr = [];
  for (var key in obj) arr.push({ name: key, value: obj[key] });
  arr.sort(function(a, b) { return b.value - a.value; });
  return arr.slice(0, limit);
}

function trendMapToArray(map) {
  var arr = [];
  var keys = Object.keys(map).sort();
  for (var i = 0; i < keys.length; i++) {
    arr.push({ date: keys[i], count: map[keys[i]] });
  }
  return arr;
}

function handleUpdateStatus(ss, data) {
  var id = String(data.id).trim(); 
  var statusType = data.type; 
  var adminName = data.adminName || "System";
  
  var sheetReg = ss.getSheetByName("Registrasi Awal");
  if (sheetReg) {
    var valuesReg = sheetReg.getDataRange().getValues();
    for (var i = 1; i < valuesReg.length; i++) {
      if (String(valuesReg[i][1]).trim() === id) { 
        if (statusType === 'VERIFICATION') {
          if (data.status) sheetReg.getRange(i + 1, 10).setValue(data.status);
          if (data.token) sheetReg.getRange(i + 1, 3).setValue("'" + data.token);
          logActivity(ss, adminName, "VERIFY_PAYMENT", id, "Status: " + data.status);
        }
        break;
      }
    }
  }

  var sheetData = ss.getSheetByName("Data Pendaftar");
  if (sheetData) {
    var valuesData = sheetData.getDataRange().getValues();
    for (var j = 1; j < valuesData.length; j++) {
      if (String(valuesData[j][1]).trim() === id) {
        if (statusType === 'DATA') {
           sheetData.getRange(j + 1, 36).setValue(data.dataStatus);
           sheetData.getRange(j + 1, 37).setValue(data.adminNotes);
           sheetData.getRange(j + 1, 38).setValue(adminName);
           logActivity(ss, adminName, "UPDATE_STATUS", id, "To: " + data.dataStatus);
        }
        break;
      }
    }
  }
  return responseJSON({ result: "success" });
}

function handleUpdateData(ss, data) {
  var sheet = ss.getSheetByName("Data Pendaftar");
  var targetId = String(data.regId).trim();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][1]).trim() === targetId) {
      if (data.fullName) sheet.getRange(i+1, 6).setValue(data.fullName);
      if (data.nisn) sheet.getRange(i+1, 9).setValue("'" + data.nisn);
      if (data.originSchool) sheet.getRange(i+1, 13).setValue(data.originSchool);
      if (data.whatsapp) sheet.getRange(i+1, 14).setValue("'" + data.whatsapp);
      logActivity(ss, data.adminName, "EDIT_DATA", targetId, "Updated bio");
      return responseJSON({ result: "success" });
    }
  }
  return responseJSON({ result: "error" });
}