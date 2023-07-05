/* ##################################################################################################
 A mobile device inventory MUT for Jamf using GAS and Google Sheets. (based on MUT)
 It's possible to use it from a Windows machine as well.
 GAS と Google Sheets を使用した Jamf 用のモバイルデバイス インベントリ MUT。 (MUTアプリを元にした)
 Windowsマシンでも利用可能です。
                        
 Author: Magic Hat Inc. (Melinda Magyar)           
 著者: 株式会社マジックハット (マジャル メリンダ)

 Last modified: 2023/07/05
 最終更新日: 2023年 7月 5日
#################################################################################################### */


// MAIN FUNCTIONS
// メインの関数群

// Variable declaration
// 変数の宣言
const PROPERTIES = PropertiesService.getScriptProperties().getProperties();
const CLASSIC_API_URL = PROPERTIES.CLASSIC_API_URL;
const JAMF_PRO_API_URL = PROPERTIES.JAMF_PRO_API_URL;
const SPREADSHEET_ID = PROPERTIES.SPREADSHEET_ID;
// Tab (sheet) name
// タブ（シート）の名前
const SHEET_NAME = PROPERTIES.SHEET_NAME; 

let bearerToken = {};

// Get all data from spreadsheet (excluding EA)
// スプレッドシートから全データを取得する（EAを除く）
/*
function getDeviceDataFromSpreadsheet() {
  // Open spreadsheet and specific sheet
  // スプレッドシートを開き、指定したシートを表示する
  const SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID); 
  // Get specific sheet
  // 特定のシートを取得する
  const SHEET = SPREADSHEET.getSheetByName(SHEET_NAME); 
  // Get all the values from the sheet
  // シートからすべての値を取得する
  const VALUES = SHEET.getDataRange().getValues(); 

  // slice(1) method is used to create a new array starting from the first element (without header)
  // map() method is applied to the array, it iterates over each row (rowData)
  // slice(1)メソッドは、ヘッダーを除いた最初の要素から新しい配列を作成するために使用され、
  // map()メソッドは、配列に適用され、各行（rowData）を繰り返する
  const DEVICE_DATA = VALUES.slice(1).map(rowData => {
    // Extracts values from the rowData array
    // rowData配列から値を抽出す
    const [
      mobileDeviceSerial,
      displayName,
      enforceName,
      assetTag,
      username,
      realName,
      emailAddress,
      position,
      phoneNumber,
      department,
      building,
      room,
      poNumber,
      vendor,
      purchasePrice,
      poDate,
      warrantyExpires,
      isLeased,
      leaseExpires,
      appleCareID,
      airplayPassword,
      site,
    ] = rowData;

    // New object is created with the values
    // 値を使用して新しいオブジェクトが作成される
    return {
      mobileDeviceSerial,
      displayName,
      enforceName,
      assetTag,
      username,
      realName,
      emailAddress,
      position,
      phoneNumber,
      department,
      building,
      room,
      poNumber,
      vendor,
      purchasePrice,
      poDate,
      warrantyExpires,
      isLeased,
      leaseExpires,
      appleCareID,
      airplayPassword,
      site,
    };
  });

  return DEVICE_DATA;
}
*/

// Get all data from spreadsheet (including EA)
// スプレッドシートから全データを取得する（EAを含む）
function getDeviceDataFromSpreadsheet() {
  // Open spreadsheet and specific sheet
  // スプレッドシートを開き、指定したシートを表示する
  const SPREADSHEET = SpreadsheetApp.openById(SPREADSHEET_ID); 
  // Get specific sheet
  // 特定のシートを取得する
  const SHEET = SPREADSHEET.getSheetByName(SHEET_NAME);
  // Get all the values from the sheet
  // シートからすべての値を取得する
  const VALUES = SHEET.getDataRange().getValues();

  // Extract the header names
  // ヘッダー名を抽出す
  const HEADER = VALUES[0]; 
  // slice(1) method is used to create a new array starting from the first element (without header)
  // map() method is applied to the array, it iterates over each row (rowData)
  // slice(1)メソッドは、ヘッダーを除いた最初の要素から新しい配列を作成するために使用され、
  // map()メソッドは、配列に適用され、各行（rowData）を繰り返する
  const DEVICE_DATA = VALUES.slice(1).map(rowData => {
    // Destructure the row data into variables
    // 行データを変数に分割代入する
    const [
      mobileDeviceSerial,
      displayName,
      enforceName,
      assetTag,
      username,
      realName,
      emailAddress,
      position,
      phoneNumber,
      department,
      building,
      room,
      poNumber,
      vendor,
      purchasePrice,
      poDate,
      warrantyExpires,
      isLeased,
      leaseExpires,
      appleCareID,
      airplayPassword,
      site,
      ...extensionAttributes
    ] = rowData;

    // New object is created with the values
    // 値を使用して新しいオブジェクトが作成される
    const deviceObject = {
      mobileDeviceSerial,
      displayName,
      enforceName,
      assetTag,
      username,
      realName,
      emailAddress,
      position,
      phoneNumber,
      department,
      building,
      room,
      poNumber,
      vendor,
      purchasePrice,
      poDate,
      warrantyExpires,
      isLeased,
      leaseExpires,
      appleCareID,
      airplayPassword,
      site,
    };

    extensionAttributes.forEach((value, index) => {
      // Calculates the column name based on the header row and index
      // ヘッダー行とインデックスに基づいて列名を計算する
      const columnName = HEADER[index + 22]; 
      // Assign values to dynamically named properties
      // 動的に名前付けされたプロパティに値を割り当てる
      deviceObject[columnName] = value; 
    });

    return deviceObject;
  });

  return DEVICE_DATA;
}

// Constructs an XML string (serves as payload in the HTTP request)
// XML文字列を構築する（HTTPリクエストのペイロードとして使用される）
function setPayloadData(rootElement, parentElement, childElement = null, objectName, childElement2 = null, objectName2 = null) {
  if(childElement2) {
    return `<mobile_device><${rootElement}><${parentElement}>` +
            `<${childElement}>${objectName}</${childElement}>` +
            `<${childElement2}>${objectName2}</${childElement2}>` +
            `</${parentElement}></${rootElement}></mobile_device>`;
  }

  if (childElement) {
    return `<mobile_device><${rootElement}><${parentElement}>` +
           `<${childElement}>${objectName}</${childElement}>` +
           `</${parentElement}></${rootElement}></mobile_device>`;
  }

  return `<mobile_device><${rootElement}><${parentElement}>${objectName}</${parentElement}></${rootElement}></mobile_device>`;
}

// Sets HTTP request options
// HTTPリクエストのオプションを設定する
function setRequestOptions(method, headers = {Authorization: `Bearer ${bearerToken.token}`}, contentType = null, payload = null) {
  const options = {
    method: method,
    muteHttpExceptions: true
  };

  if (headers) {
    options.headers = headers;
  }

  if (contentType) {
    options.contentType = contentType;
  }

  if (payload) {
    options.payload = payload;
  }

  return options;
}

// Validates HTTP request response
// HTTPリクエストのレスポンスを検証する
function validateResponse(statusCode, responseCode, objectName) {
  // Check if the response code is success
  // レスポンスコードが成功かどうかを確認する
  if (statusCode === responseCode) {
    Logger.log(`${SUCCESS}${objectName}.`);
  } else {
    Logger.log(`${objectName}${ERROR}${responseCode}`);
  }
}

// Formats the date to yyyy-mm-dd
// 日付をyyyy-mm-dd形式にフォーマットする
function setDate(dateValue) {
  try {
    return Utilities.formatDate(dateValue, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "yyyy-MM-dd");
  } catch {
    validateResponse(undefined, 'setDate()', ERROR_DATE);
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
  // console.log(XmlService.getPrettyFormat().format(document));

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

//  Uploads device data to Jamf
// Jamfにデバイスデータをアップロードする
function uploadDeviceDataToJamf() {
  // Gets device data from spreadsheet
  // スプレッドシートからデバイスデータを取得する
  const DEVICE_DATA = getDeviceDataFromSpreadsheet();
  let mobileDeviceSerialNumber = 0;

  // Loops through each item in the device data
  // デバイスデータ内の各アイテムをループする
  DEVICE_DATA.forEach((item, index) => {
    // Loops through each key in the item
    // アイテム内の各キーをループする
    for (let key in item) {
      // Checks whether values is truthy or boolean
      // 値が真偽値またはブール値であるかをチェックする
      if (item[key] || typeof item[key] === 'boolean') {

        if (key === 'mobileDeviceSerial') {
          mobileDeviceSerialNumber = item[key];
          console.log("Device: " + mobileDeviceSerialNumber);
        }

        // Handles different cases
        // 異なるケースを処理する
        switch (key) {
          case 'displayName':
            setDisplayName(mobileDeviceSerialNumber, item[key]);
            break;
          case 'enforceName':
            const mobileDeviceID = getMobileDeviceID(mobileDeviceSerialNumber);
            (item[key] === 'CLEAR!') ? setEnforceName(mobileDeviceID, false)
            : setEnforceName(mobileDeviceID, item[key]);
            break;
          case 'assetTag':
            (item[key] === 'CLEAR!') ? setAssetTag(mobileDeviceSerialNumber, '') 
            : setAssetTag(mobileDeviceSerialNumber, item[key]);
            break;
          case 'username':
            (item[key] === 'CLEAR!') ? setUsername(mobileDeviceSerialNumber, '')
            : setUsername(mobileDeviceSerialNumber, item[key]);
            break;
          case 'realName':
            (item[key] === 'CLEAR!') ? setRealName(mobileDeviceSerialNumber, '')
            : setRealName(mobileDeviceSerialNumber, item[key]);
            break;
          case 'emailAddress':
            (item[key] === 'CLEAR!') ? setEmailAddress(mobileDeviceSerialNumber, '')
            : setEmailAddress(mobileDeviceSerialNumber, item[key]);
            break;
          case 'position':
            (item[key] === 'CLEAR!') ? setPosition(mobileDeviceSerialNumber, '')
            : setPosition(mobileDeviceSerialNumber, item[key]);
            break;
          case 'phoneNumber':
            (item[key] === 'CLEAR!') ? setPhoneNumber(mobileDeviceSerialNumber, '')
            : setPhoneNumber(mobileDeviceSerialNumber, item[key]);
            break;
          case 'department':
            (item[key] === 'CLEAR!') ? setDepartment(mobileDeviceSerialNumber, '')
            : setDepartment(mobileDeviceSerialNumber, item[key]);
            break;
          case 'building':
            (item[key] === 'CLEAR!') ? setBuilding(mobileDeviceSerialNumber, '')
            : setBuilding(mobileDeviceSerialNumber, item[key]);
            break;
          case 'room':
            (item[key] === 'CLEAR!') ? setRoom(mobileDeviceSerialNumber, '')
            : setRoom(mobileDeviceSerialNumber, item[key]);
            break;
          case 'poNumber':
            (item[key] === 'CLEAR!') ? setPoNumber(mobileDeviceSerialNumber, '')
            : setPoNumber(mobileDeviceSerialNumber, item[key]);
            break;
          case 'vendor':
            (item[key] === 'CLEAR!') ? setVendor(mobileDeviceSerialNumber, '')
            : setVendor(mobileDeviceSerialNumber, item[key]);
            break;
          case 'purchasePrice':
            (item[key] === 'CLEAR!') ? setPurchasePrice(mobileDeviceSerialNumber, '')
            : setPurchasePrice(mobileDeviceSerialNumber, item[key]);
            break;
          case 'poDate':
            setPoDate(mobileDeviceSerialNumber, item[key]);
            break;
          case 'warrantyExpires':
            setWarrantyExpires(mobileDeviceSerialNumber, item[key]);
            break;
          case 'isLeased':
            setIsLeased(mobileDeviceSerialNumber, item[key]);
            break;
          case 'leaseExpires':
            setLeaseExpires(mobileDeviceSerialNumber, item[key]);
            break;
          case 'appleCareID':
            (item[key] === 'CLEAR!') ? setAppleCareID(mobileDeviceSerialNumber, '')
            : setAppleCareID(mobileDeviceSerialNumber, item[key]);
            break;
          case 'airplayPassword':
            (item[key] === 'CLEAR!') ? setAirplayPassword(mobileDeviceSerialNumber, '')
            : setAirplayPassword(mobileDeviceSerialNumber, item[key]);
            break;
          case 'site':
            (item[key] === 'CLEAR!') ? setSite(mobileDeviceSerialNumber, -1)
            : setSite(mobileDeviceSerialNumber, item[key]);
            break;     
          default:
            if (key.startsWith('EA_')) {
              const extensionAttributeID = key.substring(3); 
              (item[key] === 'CLEAR!') ? setExtensionAttribute(mobileDeviceSerialNumber, extensionAttributeID, '')
              : setExtensionAttribute(mobileDeviceSerialNumber, extensionAttributeID, item[key]);
            }
            break;               
        }
      } 
    }
  });
}

// Main function (calls other functions)
// メイン関数（他の関数を呼び出す）
function mainFunction() {
  checkTokenExpiration();
  uploadDeviceDataToJamf();
  invalidateBearerToken();
}
