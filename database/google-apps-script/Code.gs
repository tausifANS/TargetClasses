/**
 * Target Classes — Google Sheets backend.
 *
 * SETUP (one-time):
 * 1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/105kmSxUl0z8ltA5c_Oe7sPuEDHS3aKPpSQwLPautKkk/edit
 * 2. Extensions > Apps Script.
 * 3. Delete anything in the editor, paste this whole file in.
 * 4. Replace API_SECRET below with the value from server/.env (GOOGLE_SHEETS_API_SECRET) — they must match exactly.
 * 5. Deploy > New deployment > gear icon > "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 6. Click Deploy, authorize the permissions Google asks for (it's your own script/sheet).
 * 7. Copy the "Web app URL" it gives you — send that to Claude / paste into server/.env as GOOGLE_SHEETS_WEBAPP_URL.
 * 8. Any time you edit this script, you must create a NEW deployment version (Deploy > Manage deployments > edit > New version) for changes to take effect.
 *
 * Tabs are created automatically the first time each one is written to or read —
 * you don't need to create them by hand. To publish a testimonial / notice / event /
 * topper on the live site, open its tab and set the "Published" column to TRUE.
 */

const API_SECRET = 'REPLACE_WITH_YOUR_OWN_RANDOM_SECRET'; // generate one (e.g. `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`) and put the SAME value in server/.env as GOOGLE_SHEETS_API_SECRET — never commit the real value here

const SHEET_CONFIG = {
  Admissions: ['Id', 'SubmittedAt', 'StudentName', 'DOB', 'ApplyingFor', 'ParentName', 'Phone', 'Email', 'Address', 'Message', 'Status'],
  ContactMessages: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Email', 'Message', 'Status'],
  SupportRequests: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Topic', 'Message', 'Status'],
  CareerApplications: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Email', 'Message', 'Status'],
  Testimonials: ['Id', 'SubmittedAt', 'ParentName', 'StudentName', 'Message', 'Rating', 'Published'],
  Notices: ['Id', 'SubmittedAt', 'Title', 'Body', 'Published'],
  Events: ['Id', 'SubmittedAt', 'Title', 'Description', 'EventDate', 'Published'],
  Toppers: ['Id', 'SubmittedAt', 'StudentName', 'ClassName', 'Achievement', 'Year', 'Published'],
  // Enrolled students for the Student Portal login (Student ID + DOB). Add rows
  // here by hand once you've admitted a student — StudentId is whatever you want
  // to hand the parent (e.g. TC-2026-001). AttendancePercent/FeeStatus are simple
  // manually-updated summary fields, not a transaction ledger.
  Students: ['Id', 'SubmittedAt', 'StudentId', 'StudentName', 'DOB', 'ClassName', 'ParentName', 'ParentPhone', 'AttendancePercent', 'FeeStatus', 'Status'],
};

function ensureSheet_(name) {
  const headers = SHEET_CONFIG[name];
  if (!headers) throw new Error('Unknown sheet: ' + name);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function checkSecret_(params) {
  if (!params || params.secret !== API_SECRET) {
    throw new Error('Unauthorized');
  }
}

function readRows_(sheet, onlyPublished) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const publishedIdx = headers.indexOf('Published');

  return data.slice(1)
    .filter((row) => {
      if (!onlyPublished) return true;
      const val = publishedIdx === -1 ? true : row[publishedIdx];
      return val === true || String(val).toUpperCase() === 'TRUE';
    })
    .map((row) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i] instanceof Date ? row[i].toISOString() : row[i];
      });
      return obj;
    });
}

function doGet(e) {
  try {
    const params = e.parameter;
    checkSecret_(params);
    if (!params.sheet) throw new Error('Missing "sheet" parameter');

    const sheet = ensureSheet_(params.sheet);
    const rows = readRows_(sheet, params.onlyPublished === 'true');
    return jsonOutput_({ success: true, data: rows });
  } catch (err) {
    return jsonOutput_({ success: false, message: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    checkSecret_(body);
    if (!body.sheet) throw new Error('Missing "sheet" field');

    const headers = SHEET_CONFIG[body.sheet];
    if (!headers) throw new Error('Unknown sheet: ' + body.sheet);

    const sheet = ensureSheet_(body.sheet);
    const row = body.row || {};
    row.Id = row.Id || Utilities.getUuid();
    row.SubmittedAt = row.SubmittedAt || new Date().toISOString();

    const values = headers.map((h) => {
      if (row[h] !== undefined) return row[h];
      if (h === 'Status') return 'New';
      if (h === 'Published') return false;
      return '';
    });
    sheet.appendRow(values);

    return jsonOutput_({ success: true, data: { id: row.Id } });
  } catch (err) {
    return jsonOutput_({ success: false, message: err.message });
  }
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
