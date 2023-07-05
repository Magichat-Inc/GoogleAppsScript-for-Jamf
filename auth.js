// FUNCTIONS RELATED TO JAMF API TOKEN AUTHORIZATION
// JAMF APIトークン認証に関連する関数

function getBearerToken() {
  // Encode the credentials using base64
  // ベース64で認証情報をエンコードする
  const ENCODED_CREDENTIALS = Utilities.base64Encode(PROPERTIES.CREDENTIALS);
  const API_URL = `${JAMF_PRO_API_URL}/v1/auth/token`;

  // Set HTTP request options
  // HTTPリクエストのオプションを設定する
  const requestOptions = setRequestOptions('POST', {Authorization: `Basic ${ENCODED_CREDENTIALS}`});
  // Send the HTTP request to fetch the Bearer token from Jamf
  // JamfからBearerトークンを取得するためのHTTPリクエストを送信する
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  // Check if the response code is success
  // レスポンスコードが成功かどうかを確認する
  if (responseCode === 200) {
    // Parse the response JSON and retrieve the Bearer token
    // レスポンスのJSONを解析し、Bearerトークンを取得する
    bearerToken = JSON.parse(response.getContentText());
    bearerToken.expires = new Date(bearerToken.expires).getTime() / 1000;
    return bearerToken.token;
  } else {
    throw new Error(`${ERROR_AUTH}${responseCode}`);
  } 
}

function checkTokenExpiration() {
  const nowEpochUTC = Math.floor(Date.now() / 1000);
  // Compare current time with Bearer token expiraiton time
  // 現在時刻とBearerトークンの有効期限時刻を比較する
  if (bearerToken.expires > nowEpochUTC) {
    Logger.log(`${VALID_TOKEN}${bearerToken.expires}`);
  } else {
    Logger.log(NO_VALID_TOKEN);
    // Get a new token if no valid token available
    // 有効なトークンがない場合は、新しいトークンを取得する
    getBearerToken();
  }
}

function invalidateBearerToken() {
  const API_URL = `${JAMF_PRO_API_URL}/v1/auth/invalidate-token`;

  // Set HTTP request options (Authorization header is set to the currently valid Bearer token)
  // HTTPリクエストのオプションを設定する（Authorizationヘッダに現在有効なBearerトークンを設定する）
  const requestOptions = setRequestOptions('POST', undefined);
  // Send the HTTP request to invalidate the Bearer token
  // Bearerトークンを無効化するためのHTTPリクエストを送信する
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  if (responseCode === 204) {
    Logger.log(INVALIDATE_TOKEN);
    bearerToken = {};
  } else if (responseCode === 401) {
    Logger.log(INVALID_TOKEN);
    bearerToken = {};
  } else {
    throw new Error(`${ERROR_TOKEN}${responseCode}`);
  }
}
