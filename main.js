/**
 * @tool Mass Update on Google Sheets
 * @description 
 *       A mobile device inventory mass update tool for Jamf Pro utilizing GAS, Google Sheets and the Jamf API. (based on MUT)
 *       It's possible to use it from a Windows machine as well.
 *       GAS と Googleスプレッドシートを使用したJamf向けモバイルデバイスインベントリ一括更新ツール (MUTアプリを元にした)
 *       Windowsマシンでも使用可能です。
 * @author Magic Hat Inc.
 * @version 3.0.0
 * @modified 2026-09-13
 */

// VARIABLE DECLARATIONS
// 変数の宣言
const SHEET_NAME = 'MobileDeviceTemplate';
const ERROR_LOG = 'ログ';

const PROPERTIES = PropertiesService.getScriptProperties().getProperties();
const JAMF_PRO_URL = PROPERTIES.JAMF_PRO_URL;

// A single Apps Script execution is capped at 6 minutes, so a run stops short
// of that and schedules a trigger to continue where it left off
// Apps Scriptの1回の実行は6分が上限のため、その手前で停止し、
// 続きから再開するトリガーをスケジュールする
const MAX_RUNTIME = 5 * 60 * 1000;
const RESUME_HANDLER = 'runBatch';

// PROPERTIES above is a snapshot object and cannot write; this is the service
// 上の PROPERTIES はスナップショットのため書き込めない、こちらがサービス本体
function scriptProperties() {
  return PropertiesService.getScriptProperties();
}

// Retrieve the user's language setting
// ユーザーの言語設定を取得する
const USER_LANGUAGE = Session.getActiveUserLocale();

let accessToken = {};
let bearerToken = {};

// Open spreadsheet and specific sheet
// スプレッドシートを開き、指定したシートを表示する
const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
const sheet = spreadsheet.getSheetByName(SHEET_NAME);
const logSheet = spreadsheet.getSheetByName(ERROR_LOG);

// FUNCTIONS
// 関数

// Get all data from spreadsheet (including EA)
// スプレッドシートから全データを取得する（EAを含む）
function getDeviceDataFromSpreadsheet() {
  // Get all rows including header
  // ヘッダー行を含む全データを取得
  const data = sheet.getDataRange().getValues();
  // Get header for dynamic EA property naming
  // 動的EAプロパティ命名のためのヘッダーを取得
  const header = data[0];

  // Extract the data from the rows, excluding the header and remove blank serial numbers
  // 行からデータを抽出し、ヘッダーを除外し、空欄のシリアル番号を抜く
  const targetDevices = data
    .slice(1) // skip header
    .filter(row => row[0] && row[0].toString().trim() !== '') // remove blank serials
    .map(row => {
      // Destructure the data by rows into variables
      // 行データを変数に分割代入する
      const [
        serialNumber,
        displayName,
        enforceName,
        assetTag,
        username,
        realName,
        emailAddress,
        phoneNumber,
        position,
        department,
        building,
        room,
        isLeased,
        poNumber,
        poDate,
        vendor,
        warrantyExpires,
        appleCareID,
        leaseExpires,
        purchasePrice,
        lifeExpectancy,
        purchasingAccount,
        purchasingContact,
        airplayPassword,
        site,
        ...extensionAttributes
      ] = row;

      // New object is created with the values
      // 値を使用して新しいオブジェクトが作成される
      const deviceObject = {
        serialNumber,
        displayName,
        enforceName,
        assetTag,
        username,
        realName,
        emailAddress,
        phoneNumber,
        position,
        department,
        building,
        room,
        isLeased,
        poNumber,
        poDate,
        vendor,
        warrantyExpires,
        appleCareID,
        leaseExpires,
        purchasePrice,
        lifeExpectancy,
        purchasingAccount,
        purchasingContact,
        airplayPassword,
        site
      };

      extensionAttributes.forEach((value, index) => {
        // Calculates the column name based on the header row and index
        // ヘッダー行とインデックスに基づいて列名を計算する
        const columnName = header[index + 25];
        // Assign values to dynamically named properties
        // 動的に名前付けされたプロパティに値を割り当てる
        deviceObject[columnName] = value;
      });

      return deviceObject;
    });

  return targetDevices;
}

// Convert spreadsheet value
// スプレッドシートの値を変換する
function processValue(value) {
  // CLEAR! → empty value (clear field)
  if (typeof value === 'string' && value.trim().toUpperCase() === 'CLEAR!') {
    return '';
  }

  // blank → null (ignore field)
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}

// Convert spreadsheet boolean value
// スプレッドシートの真偽値を変換する
function processBooleanValue(value) {
  // CLEAR! → false (clear boolean field)
  if (typeof value === 'string' && value.trim().toUpperCase() === 'CLEAR!') {
    return 'false';
  }

  // blank → null (ignore field)
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}

// Convert spreadsheet integer value
// スプレッドシートの整数値を変換する
function processIntegerValue(value) {
  // CLEAR! → 0 (clear integer field)
  if (typeof value === 'string' && value.trim().toUpperCase() === 'CLEAR!') {
    return '0';
  }

  // blank → null (ignore field)
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  return value;
}

// Escape XML special characters
// XMLの特殊文字をエスケープする
function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build ONE XML payload per device
// デバイスごとに1つのXMLペイロードを作成する
function buildMobileDevicePayload(device) {
  let general = '';
  let location = '';
  let purchasing = '';
  let extensionAttributes = '';

  // GENERAL
  const assetTag = processValue(device.assetTag);
  const airplayPassword = processValue(device.airplayPassword);
  const site = processValue(device.site);
  // LOCATION
  const username = processValue(device.username);
  const realName = processValue(device.realName);
  const emailAddress = processValue(device.emailAddress);
  const phoneNumber = processValue(device.phoneNumber);
  const position = processValue(device.position);
  const department = processValue(device.department);
  const building = processValue(device.building);
  const room = processValue(device.room);
  // PURCHASING
  const isLeased = processValue(device.isLeased);
  const poNumber = processValue(device.poNumber);
  const poDate = processValue(device.poDate);
  const vendor = processValue(device.vendor);
  const warrantyExpires = processValue(device.warrantyExpires);
  const appleCareID = processValue(device.appleCareID);
  const leaseExpires = processValue(device.leaseExpires);
  const purchasePrice = processValue(device.purchasePrice);
  const lifeExpectancy = processIntegerValue(device.lifeExpectancy);
  const purchasingAccount = processValue(device.purchasingAccount);
  const purchasingContact = processValue(device.purchasingContact);

  if (assetTag !== null) {
    general += `<asset_tag>${escapeXml(assetTag)}</asset_tag>`;
  }

  if (airplayPassword !== null) {
    general += `<airplay_password>${escapeXml(airplayPassword)}</airplay_password>`;
  }

  if (site !== null) {
    const child = checkIfSiteValueIsNameOrID(site);
    general += `<site><${child}>${escapeXml(site)}</${child}></site>`;
  }

  if (username !== null) {
    location += `<username>${escapeXml(username)}</username>`;
  }

  if (realName !== null) {
    location += `<real_name>${escapeXml(realName)}</real_name>`;
  }

  if (emailAddress !== null) {
    location += `<email_address>${escapeXml(emailAddress)}</email_address>`;
  }

  if (phoneNumber !== null) {
    location += `<phone>${escapeXml(phoneNumber)}</phone>`;
  }

  if (position !== null) {
    location += `<position>${escapeXml(position)}</position>`;
  }

  if (department !== null) {
    location += `<department>${escapeXml(department)}</department>`;
  }

  if (building !== null) {
    location += `<building>${escapeXml(building)}</building>`;
  }

  if (room !== null) {
    location += `<room>${escapeXml(room)}</room>`;
  }

  if (isLeased !== null) {
    purchasing += `<is_leased>${escapeXml(isLeased)}</is_leased>`;
  }

  if (poNumber !== null) {
    purchasing += `<po_number>${escapeXml(poNumber)}</po_number>`;
  }

  if (poDate !== null) {
    const formattedDate = setDate(poDate);
    purchasing += `<po_date>${escapeXml(formattedDate)}</po_date>`;
  }

  if (vendor !== null) {
    purchasing += `<vendor>${escapeXml(vendor)}</vendor>`;
  }

  if (warrantyExpires !== null) {
    const formattedDate = setDate(warrantyExpires);
    purchasing += `<warranty_expires>${escapeXml(formattedDate)}</warranty_expires>`;
  }

  if (appleCareID !== null) {
    purchasing += `<applecare_id>${escapeXml(appleCareID)}</applecare_id>`;
  }

  if (leaseExpires !== null) {
    const formattedDate = setDate(leaseExpires);
    purchasing += `<lease_expires>${escapeXml(formattedDate)}</lease_expires>`;
  }

  if (purchasePrice !== null) {
    purchasing += `<purchase_price>${escapeXml(purchasePrice)}</purchase_price>`;
  }

  if (lifeExpectancy !== null) {
    purchasing += `<life_expectancy>${escapeXml(lifeExpectancy)}</life_expectancy>`;
  }

  if (purchasingAccount !== null) {
    purchasing += `<purchasing_account>${escapeXml(purchasingAccount)}</purchasing_account>`;
  }

  if (purchasingContact !== null) {
    purchasing += `<purchasing_contact>${escapeXml(purchasingContact)}</purchasing_contact>`;
  }

  Object.keys(device).forEach(key => {
    if (!key.startsWith('EA_')) {
      return;
    }

    const value = processValue(device[key]);

    if (value === null) {
      return;
    }

    const id = key.substring(3);

    extensionAttributes += `
      <extension_attribute>
        <id>${id}</id>
        <value>${escapeXml(value)}</value>
      </extension_attribute>`;
  });

  return `
    <mobile_device>
      ${general ? `<general>${general}</general>` : ''}
      ${location ? `<location>${location}</location>` : ''}
      ${purchasing ? `<purchasing>${purchasing}</purchasing>` : ''}
      ${extensionAttributes ? `<extension_attributes>${extensionAttributes}</extension_attributes>` : ''}
    </mobile_device>
  `;
}

// Sets HTTP request options
// HTTPリクエストのオプションを設定する
function setRequestOptions(method, headers, contentType = null, payload = null) {
  const options = {
    method,
    muteHttpExceptions: true
  };

  if (headers === accessToken) {
    options.headers = {
      Authorization: `Bearer ${accessToken.token}`,
      "User-Agent": encodeURIComponent(PRODUCT_NAME + '/' + VERSION),
    };
  } else if (headers === bearerToken) {
    options.headers = {
      Authorization: `Bearer ${bearerToken.token}`,
      "User-Agent": encodeURIComponent(PRODUCT_NAME + '/' + VERSION),
    };
  } else {
    options.headers = {
      "User-Agent": encodeURIComponent(PRODUCT_NAME + '/' + VERSION),
      ...headers,
    };
  }

  if (contentType) {
    options.contentType = contentType;
  }

  if (payload) {
    options.payload = payload;
  }

  return options;
}

// Extracts error message from Jamf API response content
// Jamf APIのレスポンス内容からエラーメッセージを抽出する
function extractResponseContent(responseContentText) {
  if (!responseContentText) {
    return '';
  }

  const match = responseContentText.match(/Error:\s*([^<]+)/i);
  return match ? match[1].trim() : '';
}

// Validates HTTP request response
// HTTPリクエストのレスポンスを検証する
function validateResponse(statusCode, responseCode, responseContentText, message) {
  // Check if the response code is success
  // レスポンスコードが成功かどうかを確認する
  if (statusCode === responseCode) {
    Logger.log(`SUCCESS: ${message}`);
    logHelper('SUCCESS', '', `${message}`);
    return true;
  } else {
    const parsedError = extractResponseContent(responseContentText);

    const errorText = parsedError
      ? `${message} ー ${parsedError}`
      : `${message} ー ${getLocalizedMessage('REQUEST_FAILED')}${responseCode}`;

    Logger.log(`ERROR: ${errorText}`);
    logHelper('ERROR', '', errorText);
    return false;
  }
}

// Formats the date to yyyy-mm-dd
// 日付をyyyy-mm-dd形式にフォーマットする
function setDate(dateValue) {
  try {
    return Utilities.formatDate(dateValue, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
  } catch (e) {
    return null;
  }
}

// Checks if Site value is name or ID
// Siteの値が名前かIDかをチェックする
function checkIfSiteValueIsNameOrID(value) {
  if (!isNaN(value)) {
    return 'id';
  }

  return 'name';
}

// Parsing XML response from Jamf (returns mobile device ID)
// JamfからのXMLレスポンスを解析し、モバイルデバイスのIDを返す
function parseJamfXML(xmlResponse) {
  // Parse the XML response
  // XMLレスポンスを解析する
  const document = XmlService.parse(xmlResponse);

  // Access specific elements and values from the XML
  // XMLから特定の要素や値にアクセスする
  const rootElement = document.getRootElement();
  const generalElement = rootElement.getChild('general');

  // Access child element within a parent element
  // 親要素内の子要素にアクセスする
  const mobileDeviceIDElement = generalElement.getChild('id');
  const mobileDeviceID = mobileDeviceIDElement.getText();

  return mobileDeviceID;
}

// Uploads one device's data to Jamf
// Extracted from the batch loop so a run can be interrupted between devices,
// never in the middle of one device's three API calls
// 1台分のデバイスデータをJamfにアップロードする
// バッチループから切り出し、デバイスの3回のAPI呼び出しの途中ではなく、
// デバイスとデバイスの間で中断できるようにしている
function processDevice(item) {
  logHelper('RUNNING', item.serialNumber, getLocalizedMessage('PROCESSING_DEVICE'));

  try {
    const mobileDeviceID = getMobileDeviceID(item.serialNumber);
    const displayName = processValue(item.displayName);
    const enforceName = processBooleanValue(item.enforceName);
    const payload = buildMobileDevicePayload(item);

    const hasInventoryChanges =
      payload.includes('<general>') ||
      payload.includes('<location>') ||
      payload.includes('<purchasing>') ||
      payload.includes('<extension_attributes>');

    if (displayName !== null) {
      setDisplayName(mobileDeviceID, displayName);
    }

    if (enforceName !== null) {
      setEnforceName(mobileDeviceID, enforceName);
    }

    if (hasInventoryChanges) {
      updateMobileDevice(item.serialNumber, payload);
    }

  } catch (e) {
    logHelper('ERROR', item.serialNumber, e.message);
  }
}

// Processes devices until the run is done or the time budget is spent
// Also the handler the resume trigger calls, so it must never clear the log
// 処理が完了するか、実行時間の上限に達するまでデバイスを処理する
// 再開トリガーからも呼ばれるため、ログを消去してはならない
function runBatch() {
  if (!sheet || !logSheet) {
    return;
  }

  const properties = scriptProperties();
  const startIndex = Number(properties.getProperty('LAST_INDEX')) || 0;
  const startTime = Date.now();

  let completed = false;

  try {
    // Each batch is a separate execution, so it acquires its own token
    // バッチごとに別の実行になるため、それぞれ独自にトークンを取得する
    checkTokenExpiration();

    const targetDevices = getDeviceDataFromSpreadsheet();

    if (targetDevices.length === 0) {
      logHelper('ERROR', '', getLocalizedMessage('NO_DEVICES'));
      return;
    }

    logHelper('INFO', '', `${getLocalizedMessage('BATCH_STARTED')}${startIndex + 1}/${targetDevices.length}`);

    for (let i = startIndex; i < targetDevices.length; i++) {
      processDevice(targetDevices[i]);

      // Stop short of the 6-minute limit and hand the rest to a trigger
      // 6分の制限に達する前に停止し、残りをトリガーに引き継ぐ
      if (Date.now() - startTime > MAX_RUNTIME && i + 1 < targetDevices.length) {
        properties.setProperty('LAST_INDEX', i + 1);
        scheduleNextBatch();
        logHelper('SCHEDULED', '', `${getLocalizedMessage('BATCH_PAUSED')}${i + 1}/${targetDevices.length}`);
        return;
      }
    }

    properties.deleteProperty('LAST_INDEX');
    cleanupTriggers();
    completed = true;
  } finally {
    // Release the token and write the log even if the batch failed
    // バッチが失敗した場合でも、トークンを無効化してログを書き出す
    if (Object.keys(getAuthenticationMethod()).length !== 0) {
      try {
        invalidateToken();
      } catch (e) {
        logHelper('ERROR', '', e.message);
      }
    }

    if (completed) {
      logHelper('COMPLETED', '', getLocalizedMessage('INVENTORY_UPDATE_FINISHED'));
    }

    flushLog();
  }
}

// Schedules the next batch to start shortly after this execution ends
// この実行終了直後に次のバッチが始まるようスケジュールする
function scheduleNextBatch() {
  cleanupTriggers();

  ScriptApp.newTrigger(RESUME_HANDLER)
    .timeBased()
    .after(15000)
    .create();
}

// Removes resume triggers so they cannot accumulate against the trigger quota
// 再開トリガーがトリガー数の上限に対して蓄積しないよう削除する
function cleanupTriggers() {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === RESUME_HANDLER) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

// Helper function for logging
// ログ記録のためのヘルパー関数
let logBuffer = [];

function logHelper(level, serial, message) {
  const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
  logBuffer.push([now, level, serial, message]);

  if (logBuffer.length >= 5) {
    flushLog();
  }
}

function flushLog() {
  if (!logBuffer.length) {
    return;
  }

  logSheet.getRange(logSheet.getLastRow() + 1, 1, logBuffer.length, 4).setValues(logBuffer);
  logBuffer = [];
  SpreadsheetApp.flush();
}

// Starting point
// ここから始まる
function mainFunction() {
  // Validation
  // データの検証
  if (!logSheet) {
    Logger.log(LOG_MESSAGES.MISSING_LOG_SHEET.en);
    Browser.msgBox(getLocalizedMessage('MISSING_LOG_SHEET'));
    return;
  }

  if (!sheet) {
    Logger.log(LOG_MESSAGES.MISSING_SHEET.en);
    logHelper('ERROR', '', getLocalizedMessage('MISSING_SHEET'));
    flushLog();
    Browser.msgBox(getLocalizedMessage('MISSING_SHEET'));
    return;
  }

  const properties = scriptProperties();

  // A previous run is still going, or crashed and left its position behind
  // 前回の実行が継続中、または異常終了して位置情報が残っている
  if (properties.getProperty('LAST_INDEX')) {
    const ui = SpreadsheetApp.getUi();
    const answer = ui.alert(getLocalizedMessage('BATCH_IN_PROGRESS'), ui.ButtonSet.YES_NO);

    if (answer !== ui.Button.YES) {
      return;
    }

    cleanupTriggers();
    properties.deleteProperty('LAST_INDEX');
  }

  const maxRows = logSheet.getMaxRows();

  if (maxRows > 1) {
    logSheet.getRange(2, 1, maxRows - 1, 4).clearContent();
  }

  runBatch();
}