/**
 * Hoang Luxury Travel - Google Apps Script nhận dữ liệu từ website.
 *
 * Một Web App duy nhất phục vụ hai biểu mẫu, phân biệt bằng tham số `form`:
 *   - form trống hoặc "booking"  -> ghi vào tab Bookings
 *   - form = "feedback"          -> ghi vào tab Feedback
 *
 * Cài đặt (Project Settings > Script properties):
 *   SPREADSHEET_ID   id của Google Sheet. Bỏ qua được nếu project gắn sẵn
 *                    vào file Sheet (mở bằng Extensions > Apps Script).
 *   SHEET_NAME       tuỳ chọn, mặc định "Bookings"
 *   FEEDBACK_SHEET_NAME tuỳ chọn, mặc định "Feedback" (hỗ trợ FEEDBACK_SHEET cũ)
 *
 * Sau khi sửa file này phải Deploy > Manage deployments > New version,
 * nếu không website vẫn gọi vào bản cũ.
 */

/* ------------------------------------------------------------------ *
 * Cấu hình cột
 * ------------------------------------------------------------------ */

// Tiêu đề cột tab Bookings, đúng thứ tự A -> S trong file mẫu.
const BOOKING_HEADERS = [
  "Booking ID",            // A
  "Submitted At",          // B
  "Full Name",             // C
  "Country",               // D
  "Whatsapp Number",       // E
  "Passengers",            // F
  "Luggage",               // G
  "Departure Date",        // H
  "Return Date",           // I
  "Flight Number",         // J
  "Pickup time",           // K
  "Pick-up Location",      // L
  "Drop-off Location",     // M
  "Journey Type",          // N
  "Note (Special Requirements)", // O
  "Status",                // P
  "Assigned Driver",       // Q
  "Source",                // R
  "Internal Note",         // S
];

// Tiêu đề cột tab Feedback, đúng thứ tự A -> D trong file mẫu.
const FEEDBACK_HEADERS = [
  "Booking ID", // A
  "Rating",     // B
  "Feedback",   // C
  "Note",       // D
];

const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Quoted",
  "Confirmed",
  "Completed",
  "Cancelled",
];

const JOURNEY_TYPES = [
  "One-way",
  "Round Trip",
  "Custom Request",
];

// Vị trí hàng tiêu đề mặc định khi tab còn trống. Nếu tab đã có dữ liệu,
// script tự dò hàng chứa chữ "Booking ID" nên đổi bố cục vẫn chạy đúng.
const DEFAULT_BOOKING_HEADER_ROW = 2;
const DEFAULT_FEEDBACK_HEADER_ROW = 1;
const HEADER_SCAN_ROWS = 10;

// Mã nguồn khách, ghép vào Booking ID.
const BOOKING_SOURCE_CODES = {
  RKS001: "RKS001", // web nội bộ
  RKS002: "RKS002",
  RKS003: "RKS003",
  RKS004: "RKS004",
  RKS005: "RKS005",
};
const DEFAULT_BOOKING_SOURCE = "RKS001";

/* ------------------------------------------------------------------ *
 * Điểm vào
 * ------------------------------------------------------------------ */

function doGet() {
  return jsonResponse_({ ok: true, service: "Hoang Luxury Travel forms" });
}

function doPost(event) {
  try {
    if (!event || !event.postData || String(event.postData.contents || "").length > 32768) {
      throw new Error("Invalid request size");
    }
    if (!/^application\/x-www-form-urlencoded(?:;|$)/i.test(event.postData.type || "")) {
      throw new Error("Unsupported content type");
    }
    const data = event && event.parameter ? event.parameter : {};

    // Bẫy bot: nhận im lặng, không lưu.
    if (data.website) return jsonResponse_({ ok: true });

    const formType = String(data.form || "booking").trim().toLowerCase();
    if (formType !== "booking" && formType !== "feedback") throw new Error("Invalid form");
    validateFieldBounds_(data);
    return formType === "feedback" ? saveFeedback_(data) : saveBooking_(data);
  } catch (error) {
    // Never echo exceptions: they may contain spreadsheet IDs or customer data.
    console.error("HLT form request rejected or failed");
    return jsonResponse_({ ok: false, error: "Unable to process request. Please contact us via WhatsApp." });
  }
}

/* ------------------------------------------------------------------ *
 * Tab Bookings
 * ------------------------------------------------------------------ */

function saveBooking_(data) {
  validateBooking_(data);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getBookingSheet_();
    const headerRow = resolveHeaderRow_(sheet, BOOKING_HEADERS, DEFAULT_BOOKING_HEADER_ROW);
    ensureHeaders_(sheet, headerRow, BOOKING_HEADERS);

    const submittedAt = new Date();
    const noFlight = String(data.noFlight || "").toLowerCase() === "true";
    const source = resolveBookingSource_(data.source);

    const row = [
      createBookingId_(sheet, headerRow, submittedAt, source), // A
      submittedAt,                                             // B
      safeCell_(data.fullName),                                // C
      safeCell_(data.country || data.nationality),             // D
      safeCell_(data.phone),                                   // E
      parsePassengers_(data.passengers),                       // F
      safeCell_(data.luggage),                                 // G
      parseDate_(data.departureDate, "departureDate"),         // H
      parseOptionalDate_(data.returnDate, "returnDate"),       // I
      safeCell_(noFlight ? "No flight" : data.flight),         // J
      safeCell_(noFlight ? "No flight" : data.flightTimeZone), // K
      safeCell_(data.pickup),                                  // L
      safeCell_(data.dropoff),                                 // M
      safeCell_(data.journeyType),                             // N
      safeCell_(data.requirements),                            // O
      "New",                                                   // P
      "",                                                      // Q
      source,                                                  // R
      "",                                                      // S
    ];

    const targetRow = Math.max(sheet.getLastRow() + 1, headerRow + 1);
    sheet.getRange(targetRow, 1, 1, BOOKING_HEADERS.length).setValues([row]);
    formatBookingRow_(sheet, targetRow, 1);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return jsonResponse_({ ok: true });
}

function formatBookingRow_(sheet, firstRow, rowCount) {
  sheet.getRange(firstRow, 1, rowCount, 1).setNumberFormat("@");                 // Booking ID
  sheet.getRange(firstRow, 2, rowCount, 1).setNumberFormat("dd/MM/yyyy HH:mm");  // Submitted At
  sheet.getRange(firstRow, 3, rowCount, 3).setNumberFormat("@");                 // Name / Country / Whatsapp
  sheet.getRange(firstRow, 6, rowCount, 1).setNumberFormat("0");                 // Passengers
  sheet.getRange(firstRow, 7, rowCount, 1).setNumberFormat("@");                 // Luggage
  sheet.getRange(firstRow, 8, rowCount, 2).setNumberFormat("dd/MM/yyyy");        // Departure / Return
  sheet.getRange(firstRow, 10, rowCount, 10).setNumberFormat("@");               // J -> S
}

/* ------------------------------------------------------------------ *
 * Tab Feedback
 * ------------------------------------------------------------------ */

function saveFeedback_(data) {
  const bookingId = safeCell_(data.bookingId).trim();
  const feedback = safeCell_(data.feedback || data.experience).trim();
  const rating = parseRating_(data.rating);

  if (!bookingId) throw new Error("Missing bookingId");
  if (!feedback) throw new Error("Missing feedback");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getFeedbackSheet_();
    const headerRow = resolveHeaderRow_(sheet, FEEDBACK_HEADERS, DEFAULT_FEEDBACK_HEADER_ROW);
    ensureHeaders_(sheet, headerRow, FEEDBACK_HEADERS);

    const row = [bookingId, rating, feedback, ""];
    const targetRow = Math.max(sheet.getLastRow() + 1, headerRow + 1);
    sheet.getRange(targetRow, 1, 1, FEEDBACK_HEADERS.length).setValues([row]);
    sheet.getRange(targetRow, 1).setNumberFormat("@");
    sheet.getRange(targetRow, 2).setNumberFormat("0");
    sheet.getRange(targetRow, 3, 1, 2).setNumberFormat("@");
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  return jsonResponse_({ ok: true });
}

function parseRating_(value) {
  const text = String(value || "").trim();
  if (!text || text === "0") return ""; // Rating remains optional.
  if (!/^[1-5]$/.test(text)) throw new Error("Invalid rating");
  return Number(text);
}

/* ------------------------------------------------------------------ *
 * Thiết lập bảng (chạy tay một lần từ trình soạn thảo Apps Script)
 * ------------------------------------------------------------------ */

function setupSheets() {
  setupBookingsSheet();
  setupFeedbackSheet();
}

function setupBookingsSheet() {
  const sheet = getBookingSheet_();
  const headerRow = resolveHeaderRow_(sheet, BOOKING_HEADERS, DEFAULT_BOOKING_HEADER_ROW);
  ensureHeaders_(sheet, headerRow, BOOKING_HEADERS);
  styleHeaderRow_(sheet, headerRow, BOOKING_HEADERS.length);
  sheet.setFrozenRows(headerRow);

  const rows = sheet.getMaxRows() - headerRow;
  if (rows > 0) formatBookingRow_(sheet, headerRow + 1, rows);

  configureBookingValidations_(sheet, headerRow);
}

function setupFeedbackSheet() {
  const sheet = getFeedbackSheet_();
  const headerRow = resolveHeaderRow_(sheet, FEEDBACK_HEADERS, DEFAULT_FEEDBACK_HEADER_ROW);
  ensureHeaders_(sheet, headerRow, FEEDBACK_HEADERS);
  styleHeaderRow_(sheet, headerRow, FEEDBACK_HEADERS.length);
  sheet.setFrozenRows(headerRow);

  const rows = sheet.getMaxRows() - headerRow;
  if (rows > 0) {
    sheet.getRange(headerRow + 1, 1, rows, 1).setNumberFormat("@");
    sheet.getRange(headerRow + 1, 2, rows, 1).setNumberFormat("0");
    sheet.getRange(headerRow + 1, 3, rows, 2).setNumberFormat("@");
  }
}

function styleHeaderRow_(sheet, headerRow, columnCount) {
  sheet.getRange(headerRow, 1, 1, columnCount)
    .setFontWeight("bold")
    .setFontColor("#FFFFFF")
    .setBackground("#C68A23")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);
}

function configureBookingValidations_(sheet, headerRow) {
  const rows = sheet.getMaxRows() - headerRow;
  if (rows <= 0) return;

  const journeyRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(JOURNEY_TYPES, true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(headerRow + 1, 14, rows, 1).setDataValidation(journeyRule);

  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(BOOKING_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(headerRow + 1, 16, rows, 1).setDataValidation(statusRule);
}

/* ------------------------------------------------------------------ *
 * Truy cập bảng tính
 * ------------------------------------------------------------------ */

/**
 * Lấy bảng tính. Ưu tiên Script property SPREADSHEET_ID; nếu chưa đặt mà
 * project gắn trực tiếp vào file Sheet (mở bằng Extensions > Apps Script)
 * thì dùng luôn bảng tính đang mở.
 */
function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);

  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;

  throw new Error(
    "Chua co bang tinh. Vao Project Settings > Script properties, them SPREADSHEET_ID " +
    "la doan id trong link Google Sheet (phan giua /d/ va /edit)."
  );
}

function getSheetByProperty_(propertyName, fallbackName) {
  const name = PropertiesService.getScriptProperties().getProperty(propertyName) || fallbackName;
  const spreadsheet = getSpreadsheet_();
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function getBookingSheet_() {
  return getSheetByProperty_("SHEET_NAME", "Bookings");
}

function getFeedbackSheet_() {
  const name = PropertiesService.getScriptProperties().getProperty("FEEDBACK_SHEET_NAME");
  if (name) {
    const spreadsheet = getSpreadsheet_();
    return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  }
  return getSheetByProperty_("FEEDBACK_SHEET", "Feedback");
}

/**
 * Dò hàng tiêu đề: tìm trong HEADER_SCAN_ROWS hàng đầu hàng nào có ô đầu tiên
 * trùng tiêu đề cột A. Nhờ vậy thêm/bớt dòng tiêu đề trang trí vẫn chạy đúng.
 */
function resolveHeaderRow_(sheet, headers, defaultRow) {
  const scanRows = Math.min(HEADER_SCAN_ROWS, sheet.getMaxRows());
  if (scanRows > 0) {
    const values = sheet.getRange(1, 1, scanRows, 1).getDisplayValues();
    for (let i = 0; i < values.length; i += 1) {
      if (String(values[i][0] || "").trim().toLowerCase() === headers[0].toLowerCase()) {
        return i + 1;
      }
    }
  }
  return defaultRow;
}

function ensureHeaders_(sheet, headerRow, headers) {
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  const range = sheet.getRange(headerRow, 1, 1, headers.length);
  const current = range.getDisplayValues()[0];
  const matches = headers.every(function (header, index) {
    return String(current[index] || "").trim() === header;
  });

  if (!matches) range.setValues([headers]);
}

/* ------------------------------------------------------------------ *
 * Booking ID: HLT-ddMMyy-RKS00x-NNN
 * ------------------------------------------------------------------ */

function createBookingId_(sheet, headerRow, date, source) {
  const timezone = Session.getScriptTimeZone() || "Asia/Ho_Chi_Minh";
  const datePart = Utilities.formatDate(date, timezone, "ddMMyy");
  const prefix = "HLT-" + datePart + "-" + source + "-";
  return prefix + padBookingSequence_(nextBookingSequence_(sheet, headerRow, prefix));
}

function resolveBookingSource_(value) {
  const code = String(value || "").trim().toUpperCase();
  return BOOKING_SOURCE_CODES[code] || DEFAULT_BOOKING_SOURCE;
}

/** Số thứ tự chạy riêng theo từng ngày và từng mã nguồn. */
function nextBookingSequence_(sheet, headerRow, prefix) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= headerRow) return 1;

  const values = sheet.getRange(headerRow + 1, 1, lastRow - headerRow, 1).getDisplayValues();
  let highest = 0;

  for (let i = 0; i < values.length; i += 1) {
    const id = String(values[i][0] || "").trim();
    if (id.indexOf(prefix) !== 0) continue;
    const sequence = parseInt(id.slice(prefix.length), 10);
    if (!isNaN(sequence) && sequence > highest) highest = sequence;
  }

  return highest + 1;
}

function padBookingSequence_(sequence) {
  const text = String(sequence);
  return text.length >= 3 ? text : ("000" + text).slice(-3);
}

/* ------------------------------------------------------------------ *
 * Kiểm tra dữ liệu và tiện ích
 * ------------------------------------------------------------------ */

function validateBooking_(data) {
  const required = ["fullName", "phone", "departureDate", "pickup", "dropoff", "passengers"];
  for (let i = 0; i < required.length; i += 1) {
    if (!String(data[required[i]] || "").trim()) {
      throw new Error("Missing " + required[i]);
    }
  }
  if (!/^\+?[0-9]{6,19}$/.test(String(data.phone).trim())) throw new Error("Invalid phone");
  parsePassengers_(data.passengers);
  const departure = parseDate_(data.departureDate, "departureDate");
  const returning = parseOptionalDate_(data.returnDate, "returnDate");
  if (returning && returning < departure) throw new Error("Invalid return date");
  if (JOURNEY_TYPES.indexOf(String(data.journeyType || "").trim()) < 0) throw new Error("Invalid journey type");
}

function validateFieldBounds_(data) {
  const limits = { fullName:160, country:120, nationality:120, phone:24, passengers:2,
    luggage:300, departureDate:10, returnDate:10, flight:40, flightTimeZone:40,
    pickup:500, dropoff:500, journeyType:40, requirements:4000, bookingId:100,
    feedback:4000, experience:4000, rating:1, source:20, website:300,
    submittedFrom:2048, clientTimestamp:40, form:20, noFlight:5 };
  Object.keys(data).forEach(function (key) {
    if (!Object.prototype.hasOwnProperty.call(limits, key) ||
        String(data[key]).length > limits[key] || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(String(data[key]))) {
      throw new Error("Invalid field");
    }
  });
}

function parseDate_(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) throw new Error("Missing " + fieldName);

  const parts = text.split("-");
  if (/^\d{4}-\d{2}-\d{2}$/.test(text) && Number(parts[0]) >= 2000 && Number(parts[0]) <= 2100) {
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (date.getFullYear() === Number(parts[0]) && date.getMonth() === Number(parts[1]) - 1 && date.getDate() === Number(parts[2])) return date;
  }
  throw new Error("Invalid " + fieldName);
}

function parseOptionalDate_(value, fieldName) {
  const text = String(value || "").trim();
  if (!text) return "";
  return parseDate_(text, fieldName);
}

function parsePassengers_(value) {
  const text = String(value || "").trim();
  if (!/^[1-6]$/.test(text)) throw new Error("Invalid passengers");
  return Number(text);
}

function safeCell_(value) {
  const text = String(value == null ? "" : value).trim();
  // Chặn công thức: ô bắt đầu bằng = + - @ sẽ được thêm dấu nháy đơn.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
