const BOOKING_HEADER_ROW = 4;
const BOOKING_FIRST_DATA_ROW = 5;
const JOURNEY_TYPES = [
  "Airport Transfer",
  "One-way Transfer",
  "Round Trip",
  "Long-Distance Private Transfer",
  "Custom Private Trip",
  "Business / Partner Transfer",
];
const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Quoted",
  "Confirmed",
  "Completed",
  "Cancelled",
];
const BOOKING_HEADERS = [
  "Booking ID",
  "Submitted At",
  "Full Name",
  "Contact Number",
  "Passengers",
  "Departure Date",
  "Return Date",
  "Pick-up Location",
  "Drop-off Location",
  "Journey Type",
  "Flight Number",
  "Luggage",
  "Special Requirements",
  "Status",
  "Assigned Driver",
  "Source",
  "Internal Note",
  "Country",
  "Flight Time Zone",
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

      const submittedAt = new Date();
      const row = [
        createBookingId_(submittedAt),
        submittedAt,
        safeCell_(data.fullName),
        safeCell_(data.phone),
        parsePassengers_(data.passengers),
        parseDate_(data.departureDate, "departureDate"),
        parseOptionalDate_(data.returnDate),
        safeCell_(data.pickup),
        safeCell_(data.dropoff),
        safeCell_(data.journeyType),
        safeCell_(data.flight),
        safeCell_(data.luggage),
        safeCell_(data.requirements),
        "New",
        "",
        "Website",
        "",
        safeCell_(data.country),
        safeCell_(data.flightTimeZone),
      ];

      const targetRow = Math.max(sheet.getLastRow() + 1, BOOKING_FIRST_DATA_ROW);
      sheet.getRange(targetRow, 1, 1, BOOKING_HEADERS.length).setValues([row]);
      sheet.getRange(targetRow, 1).setNumberFormat("@");
      sheet.getRange(targetRow, 2).setNumberFormat("dd/MM/yyyy HH:mm");
      sheet.getRange(targetRow, 3, 1, 2).setNumberFormat("@");
      sheet.getRange(targetRow, 5).setNumberFormat("0");
      sheet.getRange(targetRow, 6, 1, 2).setNumberFormat("dd/MM/yyyy");
      sheet.getRange(targetRow, 18, 1, 2).setNumberFormat("@");
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
  sheet.setFrozenRows(BOOKING_HEADER_ROW);
  sheet.getRange(BOOKING_HEADER_ROW, 1, 1, BOOKING_HEADERS.length)
    .setFontWeight("bold")
    .setBackground("#C68A23")
    .setFontColor("#FFFFFF");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 1, sheet.getMaxRows() - BOOKING_HEADER_ROW, 1)
    .setNumberFormat("@");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 2, sheet.getMaxRows() - BOOKING_HEADER_ROW, 1)
    .setNumberFormat("dd/MM/yyyy HH:mm");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 3, sheet.getMaxRows() - BOOKING_HEADER_ROW, 2)
    .setNumberFormat("@");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 5, sheet.getMaxRows() - BOOKING_HEADER_ROW, 1)
    .setNumberFormat("0");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 6, sheet.getMaxRows() - BOOKING_HEADER_ROW, 2)
    .setNumberFormat("dd/MM/yyyy");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 18, sheet.getMaxRows() - BOOKING_HEADER_ROW, 2)
    .setNumberFormat("@");
  configureValidations_(sheet);
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
  const currentHeaders = sheet
    .getRange(BOOKING_HEADER_ROW, 1, 1, BOOKING_HEADERS.length)
    .getDisplayValues()[0];
  const hasAnyHeader = currentHeaders.some(function (value) {
    return String(value || "").trim();
  });

  if (!hasAnyHeader) {
    sheet
      .getRange(BOOKING_HEADER_ROW, 1, 1, BOOKING_HEADERS.length)
      .setValues([BOOKING_HEADERS]);
    return;
  }

  const headersMatch = BOOKING_HEADERS.every(function (header, index) {
    return currentHeaders[index] === header;
  });

  const legacyHeadersMatch = BOOKING_HEADERS.slice(0, 17).every(function (header, index) {
    return currentHeaders[index] === header;
  });
  const newHeadersAreEmpty = currentHeaders.slice(17).every(function (header) {
    return !String(header || "").trim();
  });

  if (legacyHeadersMatch && newHeadersAreEmpty) {
    sheet
      .getRange(BOOKING_HEADER_ROW, 18, 1, 2)
      .setValues([["Country", "Flight Time Zone"]]);
    return;
  }

  if (!headersMatch) {
    throw new Error(
      "Bookings headers do not match the expected 19-column template."
    );
  }
}

function configureValidations_(sheet) {
  const dataRowCount = sheet.getMaxRows() - BOOKING_HEADER_ROW;
  const journeyValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(JOURNEY_TYPES, true)
    .setAllowInvalid(false)
    .build();
  const statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(BOOKING_STATUSES, true)
    .setAllowInvalid(false)
    .build();

  // The Excel template currently carries each dropdown one column too far.
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 11, dataRowCount, 1)
    .clearDataValidations();
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 15, dataRowCount, 1)
    .clearDataValidations();
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 10, dataRowCount, 1)
    .setDataValidation(journeyValidation);
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 14, dataRowCount, 1)
    .setDataValidation(statusValidation);
}

function validateBooking_(data) {
  const required = [
    "departureDate",
    "pickup",
    "dropoff",
    "passengers",
    "fullName",
    "phone",
    "journeyType",
    "country",
    "flightTimeZone",
  ];

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

function createBookingId_(date) {
  const timeZone = Session.getScriptTimeZone() || "Asia/Ho_Chi_Minh";
  const timestamp = Utilities.formatDate(date, timeZone, "yyyyMMdd-HHmmss");
  const suffix = Utilities.getUuid().slice(0, 4).toUpperCase();
  return "HLT-" + timestamp + "-" + suffix;
}

function parseDate_(value, fieldName) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error("Invalid date field: " + fieldName);
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );

  if (
    date.getFullYear() !== Number(match[1]) ||
    date.getMonth() !== Number(match[2]) - 1 ||
    date.getDate() !== Number(match[3])
  ) {
    throw new Error("Invalid date field: " + fieldName);
  }

  return date;
}

function parseOptionalDate_(value) {
  const text = String(value || "").trim();
  return text ? parseDate_(text, "returnDate") : "";
}

function parsePassengers_(value) {
  const passengers = Number.parseInt(String(value || ""), 10);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 50) {
    throw new Error("Invalid passenger count");
  }
  return passengers;
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
