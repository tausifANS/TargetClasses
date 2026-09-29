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

const API_SECRET = 'REPLACE_WITH_YOUR_OWN_RANDOM_SECRET'; // generate one (e.g. `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`) and put the SAME value in server/.env as GOOGLE_SHEETS_API_SECRET — never commit the real value here (a previous commit leaked the real secret to this PUBLIC repo; it must be treated as compromised and rotated)

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

  // Public website user accounts — visitors who register to like/comment.
  UserAccounts: ['Id', 'SubmittedAt', 'Name', 'Email', 'PasswordHash', 'Status'],

  // Comments — blog/post comments from users.
  Comments: ['Id', 'SubmittedAt', 'TargetId', 'TargetType', 'UserId', 'UserName', 'Text', 'Published'],

  // Likes — gallery/post like tracking (VisitorHash = IP-based unique hash).
  Likes: ['Id', 'SubmittedAt', 'TargetId', 'TargetType', 'VisitorHash'],

  // Admin accounts — additional admin/teacher accounts managed by the super admin.
  // ClassName: the batch a teacher account is scoped to (blank for full admins).
  // Permissions: comma-separated page keys a teacher account may access, e.g.
  // "students,attendance,questions" (blank/ignored for full admins, who always
  // have full access).
  AdminAccounts: ['Id', 'SubmittedAt', 'Username', 'PasswordHash', 'Role', 'Status', 'ClassName', 'Permissions'],

  // Key/value runtime settings editable from the Admin Portal (e.g. SMTP
  // credentials) — lets the admin rotate a Gmail App Password without
  // needing a code deploy, since env vars can't be changed at runtime once
  // the server is deployed. One row per key; the server upserts by finding
  // the existing row for a Key and using the normal update/delete-by-Id
  // actions, so no new Apps Script logic is needed for this table.
  Settings: ['Id', 'SubmittedAt', 'Key', 'Value'],
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
    return sheet;
  }

  // Existing sheet — self-heal any columns that were added to SHEET_CONFIG
  // after the tab already had data (e.g. adding PhotoUrl to Attendance).
  // Only ever appends new header columns; never removes or reorders
  // existing ones, so it's safe to run on every request.
  const lastCol = sheet.getLastColumn();
  const existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const missing = headers.filter((h) => existingHeaders.indexOf(h) === -1);
  if (missing.length > 0) {
    sheet.getRange(1, existingHeaders.length + 1, 1, missing.length).setValues([missing]);
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

// Google Sheets auto-converts a bare 'YYYY-MM-DD' string into an actual Date
// cell (default "Automatic" number format), which then round-trips back as a
// timezone-shifted ISO datetime instead of the plain date that was written —
// e.g. an intended "2026-08-17" becomes "2026-08-16T18:30:00.000Z". That
// silently broke same-day lookups (the Student Portal's "already punched in
// today" check, the attendance calendar). A leading apostrophe is the
// standard Sheets idiom for "store this as literal text" — it's a formatting
// hint only, never part of the stored/read value.
function preventDateAutoConvert_(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return "'" + value;
  return value;
}

function appendRow_(body) {
  const headers = SHEET_CONFIG[body.sheet];
  if (!headers) throw new Error('Unknown sheet: ' + body.sheet);

  const sheet = ensureSheet_(body.sheet);
  const row = body.row || {};
  row.Id = row.Id || Utilities.getUuid();
  row.SubmittedAt = row.SubmittedAt || new Date().toISOString();

  const values = headers.map((h) => {
    if (row[h] !== undefined) return preventDateAutoConvert_(row[h]);
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
      sheet.getRange(found.rowNumber, c + 1).setValue(preventDateAutoConvert_(patch[h]));
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
