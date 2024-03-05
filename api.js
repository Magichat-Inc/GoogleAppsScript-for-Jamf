// FUNCTIONS RELATED TO SPECIFIC JAMF API ENDPOINTS (mobile devices)
// Jamf APIの客エンドポイントに関連する関数　（モバイルデバイス）

function getMobileDeviceID(serialNumber) {
  const API_URL =  `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`;

  const requestOptions = setRequestOptions('GET', undefined, 'application/json');
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  if (responseCode === 200) {
    // Parse the response XML and retrieve the mobile device ID
    // レスポンスのXMLを解析し、モバイルデバイスのIDを取得する
    return parseJamfXML(response.getContentText());
  } else {
    validateResponse(200, responseCode, 'getMobileDeviceID()');
  }
}

function setDisplayName(serialNumber, displayName) {
  const xmlData = setPayloadData('general', 'display_name', undefined, displayName);

  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);
  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  ); 

  validateResponse(201, response.getResponseCode(), 'Display Name');
}

// This is going to be a Management Command in Jamf Pro
// こちらはJamf Proで管理コマンドとしてある
function setEnforceName(mobileDeviceID, enforceNameValue) {
  const jsonData = JSON.stringify({ enforceName: enforceNameValue });

  const requestOptions = setRequestOptions('PATCH', undefined, 'application/json', jsonData);
  const response = UrlFetchApp.fetch(
    `${JAMF_PRO_API_URL}/v2/mobile-devices/${mobileDeviceID}`, 
    requestOptions
  );

  validateResponse(200, response.getResponseCode(), 'Enforce Name');
}

function setAssetTag(serialNumber, assetTag) {
  const xmlData = setPayloadData('general', 'asset_tag', undefined, assetTag);

  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);
  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Asset Tag');
}

function setUsername(serialNumber, username) {
  const xmlData = setPayloadData('location', 'username', undefined, username);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Username');
}

function setRealName(serialNumber, realName) {
  const xmlData = setPayloadData('location', 'real_name', undefined, realName);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Real Name');
}

function setEmailAddress(serialNumber, emailAddress) {
  const xmlData = setPayloadData('location', 'email_address', undefined, emailAddress);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Email Address');
}

function setPhoneNumber(serialNumber, phoneNumber) {
  const xmlData = setPayloadData('location', 'phone', undefined, phoneNumber);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Phone Number');
}

function setPosition(serialNumber, position) {
  const xmlData = setPayloadData('location', 'position', undefined, position);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Position');
}

function setDepartment(serialNumber, department) {
  const xmlData = setPayloadData('location', 'department', undefined, department);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Department');
}

function setBuilding(serialNumber, building) {
  const xmlData = setPayloadData('location', 'building', undefined, building);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Building');
}

function setRoom(serialNumber, room) {
  const xmlData = setPayloadData('location', 'room', undefined, room);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Room');
}

function setIsLeased(serialNumber, isLeased) {
  const xmlData = setPayloadData('purchasing', 'is_leased', undefined, isLeased);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Purchased or Leased');
}

function setPoNumber(serialNumber, poNumber) {
  const xmlData = setPayloadData('purchasing', 'po_number', undefined, poNumber);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'PO Number');
}

function setPoDate(serialNumber, poDate) {
  const xmlData = setPayloadData('purchasing', 'po_date', undefined, setDate(poDate));
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'PO Date');
}

function setVendor(serialNumber, vendor) {
  const xmlData = setPayloadData('purchasing', 'vendor', undefined, vendor);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Vendor');
}

function setWarrantyExpires(serialNumber, warrantyExpires) {
  const xmlData = setPayloadData('purchasing', 'warranty_expires', undefined, setDate(warrantyExpires));
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Warranty Expiration');
}

function setAppleCareID(serialNumber, appleCareID) {
  const xmlData = setPayloadData('purchasing', 'applecare_id', undefined, appleCareID);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'AppleCare ID');
}

function setLeaseExpires(serialNumber, leaseExpires) {
  const xmlData = setPayloadData('purchasing', 'lease_expires', undefined, setDate(leaseExpires));
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Lease Expiration');
}

function setPurchasePrice(serialNumber, purchasePrice) {
  const xmlData = setPayloadData('purchasing', 'purchase_price', undefined, purchasePrice);
  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);

  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Purchase Price');
}

function setAirplayPassword(serialNumber, airPlayPassword) {
  const xmlData = setPayloadData('general', 'airplay_password', undefined, airPlayPassword);

  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);
  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'AirPlay Password');
}

function setSite(serialNumber, site) {
  const childElement = checkIfSiteValueIsNameOrID(site);
  const xmlData = setPayloadData('general', 'site', childElement, site);

  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);
  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), 'Site');
}

function setExtensionAttribute(serialNumber, extensionAttributeID, extensionAttribute) {
  if ( extensionAttribute instanceof Date) {
    extensionAttribute = setDate(extensionAttribute);
  }

  const xmlData = setPayloadData('extension_attributes', 'extension_attribute', 'id', extensionAttributeID, 'value', extensionAttribute);

  const requestOptions = setRequestOptions('PUT', undefined, 'text/xml', xmlData);
  const response = UrlFetchApp.fetch(
    `${CLASSIC_API_URL}/mobiledevices/serialnumber/${serialNumber}`, 
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), `Extension Attribute (ID: ${extensionAttributeID})`);
}
