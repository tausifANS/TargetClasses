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
 * topper / post on the live site, open its tab and set the "Published" column to TRUE.
 */

const API_SECRET = '0893aef82a395e6039260a9cd0fc6b615833d4ecb63e2775';

const SHEET_CONFIG = {
  Admissions: ['Id', 'SubmittedAt', 'StudentName', 'DOB', 'ApplyingFor', 'ParentName', 'Phone', 'Email', 'Address', 'Message', 'Status'],
  ContactMessages: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Email', 'Message', 'Status'],
  SupportRequests: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Topic', 'Message', 'Status'],
  CareerApplications: ['Id', 'SubmittedAt', 'Name', 'Phone', 'Email', 'Message', 'Status'],
  Testimonials: ['Id', 'SubmittedAt', 'ParentName', 'StudentName', 'Message', 'Rating', 'Published'],
  Notices: ['Id', 'SubmittedAt', 'Title', 'Body', 'Published'],
  Events: ['Id', 'SubmittedAt', 'Title', 'Description', 'EventDate', 'Published'],
  Toppers: ['Id', 'SubmittedAt', 'StudentName', 'ClassName', 'Achievement', 'Year', 'Published'],

  // Student Portal signup requests — submitted from the public site, reviewed by
  // the admin. Approving one creates a StudentAccounts row and emails credentials.
  PortalApplications: ['Id', 'SubmittedAt', 'StudentName', 'DOB', 'ClassName', 'Subjects', 'ParentName', 'ParentPhone', 'Email', 'Address', 'Status'],

  // Enrolled students who can log into the Student Portal (StudentId + password —
  // PasswordHash is a bcrypt hash written by the server, never a plaintext password).
  StudentAccounts: ['Id', 'SubmittedAt', 'StudentId', 'StudentName', 'ClassName', 'Email', 'ParentPhone', 'PasswordHash', 'Status', 'ApplicationId'],

  // Punch in/out attendance, one row per student per day.
  Attendance: ['Id', 'StudentId', 'Date', 'PunchIn', 'PunchOut', 'PhotoUrl'],

  // Live/recorded classes the admin posts for students to access, filtered by ClassName.
  Classes: ['Id', 'SubmittedAt', 'Title', 'Subject', 'ClassName', 'Type', 'Url', 'ScheduledAt', 'Published'],

  // Admin-authored posts/announcements — Highlighted posts get featured styling on the site.
  Posts: ['Id', 'SubmittedAt', 'Title', 'Body', 'ImageUrl', 'Highlighted', 'Published'],

  // Admin-uploaded gallery photos (in addition to the static launch gallery).
  GalleryItems: ['Id', 'SubmittedAt', 'Category', 'ImageUrl', 'Caption', 'Published'],

  // Faculty team shown on the public Faculty page + homepage preview, fully
  // managed from the Admin Portal (add/edit/delete, with photo upload).
  Teachers: ['Id', 'SubmittedAt', 'Name', 'Position', 'Subjects', 'PhotoUrl', 'DisplayOrder', 'Published'],

  // Questions — MCQ and written practice questions posted by admin.
  Questions: ['Id', 'SubmittedAt', 'ClassName', 'Subject', 'Title', 'Description', 'Type', 'Options', 'CorrectAnswer', 'Answer', 'PdfUrl', 'Published'],

  // Notes — PDF/notes shared with students.
  Notes: ['Id', 'SubmittedAt', 'ClassName', 'Subject', 'Title', 'Description', 'PdfUrl', 'Published'],

  // Results — exam results uploaded by admin.
  Results: ['Id', 'SubmittedAt', 'ClassName', 'Subject', 'ExamName', 'ExamDate', 'Description', 'PdfUrl', 'Published'],

  // Comments — blog/post comments from students.
  Comments: ['Id', 'SubmittedAt', 'TargetId', 'TargetType', 'StudentId', 'StudentName', 'Text', 'Published'],

  // Likes — gallery/post like tracking (VisitorHash = IP-based unique hash).
  Likes: ['Id', 'SubmittedAt', 'TargetId', 'TargetType', 'VisitorHash'],

  // Admin accounts — additional admin/sub-admin accounts managed by super admin.
  AdminAccounts: ['Id', 'SubmittedAt', 'Username', 'PasswordHash', 'Role', 'Status'],
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

    const action = body.action || 'append';
    if (action === 'update') return jsonOutput_(updateRow_(body));
    if (action === 'delete') return jsonOutput_(deleteRow_(body));
    return jsonOutput_(appendRow_(body));
  } catch (err) {
    return jsonOutput_({ success: false, message: err.message });
  }
}

function appendRow_(body) {
  const headers = SHEET_CONFIG[body.sheet];
  if (!headers) throw new Error('Unknown sheet: ' + body.sheet);

  const sheet = ensureSheet_(body.sheet);
  const row = body.row || {};
  row.Id = row.Id || Utilities.getUuid();
  row.SubmittedAt = row.SubmittedAt || new Date().toISOString();

  const values = headers.map((h) => {
    if (row[h] !== undefined) return row[h];
    if (h === 'Status') return 'New';
    if (h === 'Published' || h === 'Highlighted') return false;
    return '';
  });
  sheet.appendRow(values);

  return { success: true, data: { id: row.Id } };
}

function findRowIndexById_(sheet, headers, id) {
  const data = sheet.getDataRange().getValues();
  const idIdx = headers.indexOf('Id');
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idIdx]) === String(id)) return { rowNumber: r + 1, rowValues: data[r] };
  }
  return null;
}

function updateRow_(body) {
  const headers = SHEET_CONFIG[body.sheet];
  if (!headers) throw new Error('Unknown sheet: ' + body.sheet);
  if (!body.id) throw new Error('Missing "id" field');

  const sheet = ensureSheet_(body.sheet);
  const found = findRowIndexById_(sheet, headers, body.id);
  if (!found) throw new Error('Row not found: ' + body.id);

  const patch = body.patch || {};
  const updated = {};
  headers.forEach((h, c) => {
    if (patch[h] !== undefined) {
      sheet.getRange(found.rowNumber, c + 1).setValue(patch[h]);
      updated[h] = patch[h];
    } else {
      updated[h] = found.rowValues[c] instanceof Date ? found.rowValues[c].toISOString() : found.rowValues[c];
    }
  });

  return { success: true, data: updated };
}

function deleteRow_(body) {
  const headers = SHEET_CONFIG[body.sheet];
  if (!headers) throw new Error('Unknown sheet: ' + body.sheet);
  if (!body.id) throw new Error('Missing "id" field');

  const sheet = ensureSheet_(body.sheet);
  const found = findRowIndexById_(sheet, headers, body.id);
  if (!found) throw new Error('Row not found: ' + body.id);

  sheet.deleteRow(found.rowNumber);
  return { success: true, data: { id: body.id } };
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
