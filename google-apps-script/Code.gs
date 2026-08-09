const BOOKING_HEADER_ROW = 4;
const BOOKING_FIRST_DATA_ROW = 5;
const JOURNEY_TYPES = [
  "One-way",
  "Round Trip",
  "Custom Request",
];
const BOOKING_STATUSES = [
  "New",
  "Contacted",
  "Quoted",
  "Confirmed",
  "Completed",
  "Cancelled",
];
const LEGACY_BOOKING_HEADERS = [
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
const BOOKING_HEADERS = [
  "Submitted At",
  "Booking ID",
  "Departure Date",
  "Return Date",
  "Full Name",
  "Contact Number",
  "Country",
  "Passengers",
  "Pick-up Location",
  "Drop-off Location",
  "Flight Number",
  "Flight Time",
  "Journey Type",
  "Special Requirements",
  "Status",
];
const PREVIOUS_BOOKING_HEADERS = [
  "Submitted At",
  "Booking ID",
  "Departure Date",
  "Return Date",
  "Full Name",
  "Contact Number",
  "Nationality",
  "Passengers",
  "Pick-up Location",
  "Drop-off Location",
  "Flight Number",
  "Flight Time",
  "Journey Type",
  "Special Requirements",
  "Status",
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
        submittedAt,
        createBookingId_(submittedAt),
        parseDate_(data.departureDate, "departureDate"),
        parseOptionalDate_(data.returnDate, "returnDate"),
        safeCell_(data.fullName),
        safeCell_(data.phone),
        safeCell_(data.country || data.nationality),
        parsePassengers_(data.passengers),
        safeCell_(data.pickup),
        safeCell_(data.dropoff),
        safeCell_(data.flight),
        safeCell_(data.flightTimeZone),
        safeCell_(data.journeyType),
        safeCell_(data.requirements),
        "New",
      ];

      const targetRow = Math.max(sheet.getLastRow() + 1, BOOKING_FIRST_DATA_ROW);
      sheet.getRange(targetRow, 1, 1, BOOKING_HEADERS.length).setValues([row]);
      sheet.getRange(targetRow, 1).setNumberFormat("dd/MM/yyyy HH:mm");
      sheet.getRange(targetRow, 2).setNumberFormat("@");
      sheet.getRange(targetRow, 3, 1, 2).setNumberFormat("dd/MM/yyyy");
      sheet.getRange(targetRow, 5, 1, 3).setNumberFormat("@");
      sheet.getRange(targetRow, 8).setNumberFormat("0");
      sheet.getRange(targetRow, 9, 1, 6).setNumberFormat("@");
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
    .setNumberFormat("dd/MM/yyyy HH:mm");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 2, sheet.getMaxRows() - BOOKING_HEADER_ROW, 1)
    .setNumberFormat("@");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 3, sheet.getMaxRows() - BOOKING_HEADER_ROW, 2)
    .setNumberFormat("dd/MM/yyyy");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 5, sheet.getMaxRows() - BOOKING_HEADER_ROW, 3)
    .setNumberFormat("@");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 8, sheet.getMaxRows() - BOOKING_HEADER_ROW, 1)
    .setNumberFormat("0");
  sheet.getRange(BOOKING_FIRST_DATA_ROW, 9, sheet.getMaxRows() - BOOKING_HEADER_ROW, 6)
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
  const inspectedColumnCount = Math.max(
    BOOKING_HEADERS.length,
    LEGACY_BOOKING_HEADERS.length
  );
  const inspectedHeaders = sheet
    .getRange(BOOKING_HEADER_ROW, 1, 1, inspectedColumnCount)
    .getDisplayValues()[0];
  const currentHeaders = inspectedHeaders.slice(0, BOOKING_HEADERS.length);
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

  const previousHeadersMatch = PREVIOUS_BOOKING_HEADERS.every(function (header, index) {
    return currentHeaders[index] === header;
  });

  const legacyHeadersMatch = LEGACY_BOOKING_HEADERS.every(function (header, index) {
    return inspectedHeaders[index] === header;
  });

  if (legacyHeadersMatch) {
    migrateLegacyBookings_(sheet);
    return;
  }

  if (previousHeadersMatch) {
    sheet.getRange(BOOKING_HEADER_ROW, 7).setValue("Country");
    return;
  }

  if (!headersMatch) {
    throw new Error(
      "Bookings headers do not match the expected 15-column template."
    );
  }
}

function migrateLegacyBookings_(sheet) {
  const existingDataRowCount = Math.max(
    0,
    sheet.getLastRow() - BOOKING_HEADER_ROW
  );
  let migratedRows = [];

  if (existingDataRowCount > 0) {
    const legacyRows = sheet
      .getRange(
        BOOKING_FIRST_DATA_ROW,
        1,
        existingDataRowCount,
        LEGACY_BOOKING_HEADERS.length
      )
      .getValues();

    migratedRows = legacyRows.map(function (row) {
      return [
        row[1],
        row[0],
        row[5],
        row[6],
        row[2],
        row[3],
        row[17],
        row[4],
        row[7],
        row[8],
        row[10],
        row[18],
        row[9],
        row[12],
        row[13],
      ];
    });
  }

  sheet
    .getRange(
      BOOKING_HEADER_ROW,
      1,
      Math.max(1, sheet.getMaxRows() - BOOKING_HEADER_ROW + 1),
      LEGACY_BOOKING_HEADERS.length
    )
    .clearContent();
  sheet
    .getRange(BOOKING_HEADER_ROW, 1, 1, BOOKING_HEADERS.length)
    .setValues([BOOKING_HEADERS]);

  if (migratedRows.length > 0) {
    sheet
      .getRange(
        BOOKING_FIRST_DATA_ROW,
        1,
        migratedRows.length,
        BOOKING_HEADERS.length
      )
      .setValues(migratedRows);
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

  sheet
    .getRange(
      BOOKING_FIRST_DATA_ROW,
      1,
      dataRowCount,
      LEGACY_BOOKING_HEADERS.length
    )
    .clearDataValidations();
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 13, dataRowCount, 1)
    .setDataValidation(journeyValidation);
  sheet
    .getRange(BOOKING_FIRST_DATA_ROW, 15, dataRowCount, 1)
    .setDataValidation(statusValidation);
}

function validateBooking_(data) {
  const required = [
    "departureDate",
    "pickup",
    "dropoff",
    "flight",
    "passengers",
    "fullName",
    "phone",
    "journeyType",
    "country",
    "flightTimeZone",
    "luggage",
  ];

  required.forEach(function (field) {
    const value = field === "country"
      ? data.country || data.nationality
      : data[field];

    if (!String(value || "").trim()) {
      throw new Error("Missing required field: " + field);
    }
  });

  const phone = String(data.phone || "").trim();
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new Error("Invalid contact number");
  }

  const flightTime = String(data.flightTimeZone || "").trim();
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(flightTime)) {
    throw new Error("Invalid 24-hour flight time");
  }

  if (JOURNEY_TYPES.indexOf(String(data.journeyType || "").trim()) === -1) {
    throw new Error("Invalid journey type");
  }

  const departureDate = parseDate_(data.departureDate, "departureDate");
  const returnDate = parseOptionalDate_(data.returnDate, "returnDate");
  if (returnDate && returnDate.getTime() < departureDate.getTime()) {
    throw new Error("Return date cannot be before departure date");
  }

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

function parseOptionalDate_(value, fieldName) {
  const text = String(value || "").trim();
  return text ? parseDate_(text, fieldName) : "";
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
