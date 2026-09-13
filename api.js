// FUNCTIONS RELATED TO SPECIFIC JAMF API ENDPOINTS (mobile devices)
// 特定のJAMF APIエンドポイント（モバイルデバイス）に関連する関数

function getMobileDeviceID(serialNumber) {
  const API_URL = `${JAMF_PRO_URL}/JSSResource/mobiledevices/serialnumber/${serialNumber}`;

  const requestOptions = setRequestOptions('GET', getAuthenticationMethod(), 'application/json');
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  if (responseCode === 200) {
    // Parse the response XML and retrieve the mobile device ID
    // レスポンスのXMLを解析し、モバイルデバイスのIDを取得する
    return parseJamfXML(response.getContentText());
  } else {
    validateResponse(200, responseCode, response.getContentText(), getLocalizedMessage('MOBILE_DEVICE_ID'));
    throw new Error(`${getLocalizedMessage('MOBILE_DEVICE_ID')} failed for serial ${serialNumber}`);
  }
}

function setDisplayName(mobileDeviceID, displayName) {
  const jsonData = JSON.stringify({ name: displayName });
  const requestOptions = setRequestOptions('PATCH', getAuthenticationMethod(), 'application/json', jsonData);

  const response = UrlFetchApp.fetch(
    `${JAMF_PRO_URL}/api/v2/mobile-devices/${mobileDeviceID}`,
    requestOptions
  );

  validateResponse(200, response.getResponseCode(), response.getContentText(), getLocalizedMessage('DISPLAY_NAME'));
}

// This is going to be a Management Command in Jamf Pro
// Jamf Proの管理コマンドになります
function setEnforceName(mobileDeviceID, enforceNameValue) {
  const jsonData = JSON.stringify({ enforceName: enforceNameValue });
  const requestOptions = setRequestOptions('PATCH', getAuthenticationMethod(), 'application/json', jsonData);

  const response = UrlFetchApp.fetch(
    `${JAMF_PRO_URL}/api/v2/mobile-devices/${mobileDeviceID}`,
    requestOptions
  );

  validateResponse(200, response.getResponseCode(), response.getContentText(), getLocalizedMessage('ENFORCE_NAME'));
}

function updateMobileDevice(serialNumber, payload) {
  const requestOptions = setRequestOptions('PUT', getAuthenticationMethod(), 'text/xml', payload);

  const response = UrlFetchApp.fetch(
    `${JAMF_PRO_URL}/JSSResource/mobiledevices/serialnumber/${serialNumber}`,
    requestOptions
  );

  validateResponse(201, response.getResponseCode(), response.getContentText(), getLocalizedMessage('INVENTORY_ITEMS'));
}
