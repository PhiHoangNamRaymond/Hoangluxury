const BOOKING_HEADERS = [
  "Booking ID",
  "Received At",
  "Departure Date",
  "Return Date",
  "Pick-up Location",
  "Drop-off Location",
  "Flight Number",
  "Passengers",
  "Full Name",
  "Contact Number",
  "Journey Type",
  "Luggage",
  "Special Requirements",
  "Submitted From",
  "Client Timestamp",
];

function doGet() {
  return jsonResponse_({ ok: true, service: "Hoang Luxury Travel bookings" });
}

function doPost(event) {
  try {
    const data = event && event.parameter ? event.parameter : {};

    // Honeypot submissions are accepted silently but never stored.
    if (data.website) return jsonResponse_({ ok: true });

    validateBooking_(data);

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    try {
      const sheet = getBookingSheet_();
      ensureHeaders_(sheet);
      sheet.appendRow([
        Utilities.getUuid(),
        new Date(),
        safeCell_(data.departureDate),
        safeCell_(data.returnDate),
        safeCell_(data.pickup),
        safeCell_(data.dropoff),
        safeCell_(data.flight),
        safeCell_(data.passengers),
        safeCell_(data.fullName),
        safeCell_(data.phone),
        safeCell_(data.journeyType),
        safeCell_(data.luggage),
        safeCell_(data.requirements),
        safeCell_(data.submittedFrom),
        safeCell_(data.clientTimestamp),
      ]);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: "Unable to save booking" });
  }
}

function setupBookingsSheet() {
  const sheet = getBookingSheet_();
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, BOOKING_HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#082019")
    .setFontColor("#d8a849");
  sheet.autoResizeColumns(1, BOOKING_HEADERS.length);
}

function getBookingSheet_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const sheetName = properties.getProperty("SHEET_NAME") || "Bookings";

  if (!spreadsheetId) {
    throw new Error("Missing SPREADSHEET_ID in Script Properties");
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() !== 0) return;
  sheet.appendRow(BOOKING_HEADERS);
}

function validateBooking_(data) {
  const required = ["departureDate", "pickup", "dropoff", "passengers", "fullName", "phone", "journeyType"];

  required.forEach(function (field) {
    if (!String(data[field] || "").trim()) {
      throw new Error("Missing required field: " + field);
    }
  });

  Object.keys(data).forEach(function (field) {
    if (String(data[field] || "").length > 2000) {
      throw new Error("Field is too long: " + field);
    }
  });
}

function safeCell_(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
