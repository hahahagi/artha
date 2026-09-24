import { google } from "googleapis";

export interface SheetExpenseRow {
  date: string;
  itemName: string;
  category: string;
  amount: number;
  currency: string;
  wallet?: string;
  source: string;
}

const HEADERS = [
  "Tanggal",
  "Nama Pengeluaran",
  "Kategori",
  "Nominal",
  "Mata Uang",
  "Sumber Dana",
  "Asal Input",
];

export function getSheetsClient() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error(
      "Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL atau GOOGLE_PRIVATE_KEY) belum dikonfigurasi.",
    );
  }

  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Menambahkan satu baris transaksi ke Google Spreadsheet
 */
export async function appendExpenseToSheet(
  spreadsheetId: string,
  row: SheetExpenseRow,
) {
  const sheets = getSheetsClient();

  const values = [
    [
      row.date,
      row.itemName,
      row.category,
      row.amount,
      row.currency,
      row.wallet || "-",
      row.source,
    ],
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "A:G",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });
}

/**
 * Melakukan sinkronisasi penuh (bulk overwrite) seluruh daftar transaksi ke Google Spreadsheet
 */
export async function syncAllExpensesToSheet(
  spreadsheetId: string,
  rows: SheetExpenseRow[],
) {
  const sheets = getSheetsClient();

  const dataValues = [
    HEADERS,
    ...rows.map((r) => [
      r.date,
      r.itemName,
      r.category,
      r.amount,
      r.currency,
      r.wallet || "-",
      r.source,
    ]),
  ];

  // Bersihkan sheet terlebih dahulu lalu tulis ulang
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "A:G",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: dataValues },
  });
}