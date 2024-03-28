// FUNCTIONS RELATED TO JAMF API TOKEN AUTHENTICATION
// JAMF APIトークン認証に関連する関数

// Set and handle authentication based on property conditions
// プロパティ条件に基づいて認証を設定および処理する
function setAuthenticationMethod() {
  try {
    // Client based authentication (Access token)
    // クライアントベースの認証 (Accessトークン)
    if (PROPERTIES.CLIENT_ID !== undefined && PROPERTIES.CLIENT_SECRET !== undefined) {
      getAccessToken();
    // User based authentication (Bearer token)
    // ユーザーベースの認証 (Bearerトークン)
    } else if (PROPERTIES.CREDENTIALS !== undefined) {
      getBearerToken();
    } else {
      throw new Error(ERROR_PROPERTIES);
    }
  } catch (e) {
    console.error('ERROR:', e.message);

    // Show error message to the user
    const ui = SpreadsheetApp.getUi();
    ui.alert('ERROR', e.message, ui.ButtonSet.OK);
  }
}

function getAuthenticationMethod() {
  if (Object.keys(accessToken).length !== 0) {
    return accessToken;
  }
  
  if (Object.keys(bearerToken).length !== 0) {
    return bearerToken;
  } 

  // Return an empty object if no valid token is available
  // 有効なトークンが利用できない場合は空のオブジェクトを返する
  return {};
}

// Creates a query string from an object to be used in HTTP request (getAccessToken())
// オブジェクトからクエリ文字列を生成し、HTTPリクエスト（getAccessToken()）で使用する
function queryString(param) {
  const array = []

  for (let k in param) {
    // Encode the key and value using URI encoding
    // Push the encoded key-value pair to the array
    // キーと値をURIエンコードしてる
    // エンコードされたキーと値のペアを配列に追加する
    array.push(k + '=' + encodeURI(param[k]))
  }

  // Join the array elements using ampersands to form the query string
  // 配列の要素をアンパサンド（&）で結合してクエリ文字列を作成する
  return array.join('&')
}

function getAccessToken() {
  const API_URL = `${JAMF_PRO_URL}/api/oauth/token`; 

  // Key-value pairs for the query string
  // クエリ文字列に使うキーと値のペアのオブジェクト
  const params = {
    'client_id': PROPERTIES.CLIENT_ID,
    'grant_type': 'client_credentials',
    'client_secret': PROPERTIES.CLIENT_SECRET
  };

  // Set HTTP request options
  // HTTPリクエストのオプションを設定する
  const requestOptions = setRequestOptions('POST', undefined, 'application/x-www-form-urlencoded', queryString(params));
  // Send the HTTP request to fetch the Access token from Jamf
  // JamfからAccessトークンを取得するためのHTTPリクエストを送信する
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  // Check if the response code is success
  // レスポンスコードが成功かどうかを確認する
  if (responseCode === 200) {
    // Parse the response JSON and retrieve the Access token
    // レスポンスのJSONを解析し、Accessトークンを取得する
    const responseData = JSON.parse(response.getContentText());
    accessToken.token = responseData.access_token;
    accessToken.type = responseData.token_type;
    accessToken.expires = Math.floor(Date.now() / 1000) + responseData.expires_in - 1;
    accessToken.expires_in = responseData.expires_in;
    accessToken.scope = responseData.scope;
    return accessToken.token;
  } else {
    throw new Error(`${ERROR_AUTH}${responseCode}`);
  } 
}

function getBearerToken() {
  // Encode the credentials using base64
  // ベース64で認証情報をエンコードする
  const ENCODED_CREDENTIALS = Utilities.base64Encode(PROPERTIES.CREDENTIALS);
  const API_URL = `${JAMF_PRO_URL}/api/v1/auth/token`;

  // Set HTTP request options
  // HTTPリクエストのオプションを設定する
  const requestOptions = setRequestOptions('POST', { Authorization: `Basic ${ENCODED_CREDENTIALS}` });
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
    bearerToken.expires = Math.floor(new Date(bearerToken.expires).getTime() / 1000);
    return bearerToken.token;
  } else {
    throw new Error(`${ERROR_AUTH}${responseCode}`);
  } 
}

function checkTokenExpiration() {
  const token = getAuthenticationMethod();

  const nowEpochUTC = Math.floor(Date.now() / 1000);
  // Compare current time with token expiraiton time
  // 現在時刻とトークンの有効期限時刻を比較する
  if (token.expires > nowEpochUTC) {
    Logger.log(`${VALID_TOKEN}${token.expires}`);
  } else {
    Logger.log(NO_VALID_TOKEN);
    // Get a new token if no valid token available
    // 有効なトークンがない場合は、認証方法を設定して、新しいトークンを取得する
    setAuthenticationMethod();
  }
}

function invalidateToken () {
  const API_URL = `${JAMF_PRO_URL}/api/v1/auth/invalidate-token`;

  // Set HTTP request options (Authorization header is set to the currently valid token)
  // HTTPリクエストのオプションを設定する（Authorizationヘッダに現在有効なトークンを設定する）
  const requestOptions = setRequestOptions('POST', getAuthenticationMethod());

  // Send the HTTP request to invalidate the token
  // トークンを無効化するためのHTTPリクエストを送信する
  const response = UrlFetchApp.fetch(API_URL, requestOptions);
  const responseCode = response.getResponseCode();

  if (responseCode === 204) {
    getAuthenticationMethod() === accessToken ? (accessToken = {}) : (bearerToken = {});
    Logger.log(INVALIDATED_TOKEN);
  } else if (responseCode === 401) {
    getAuthenticationMethod() === accessToken ? (accessToken = {}) : (bearerToken = {});
    Logger.log(INVALID_TOKEN);
  } else {
    throw new Error(`${ERROR_TOKEN}${responseCode}`);
  }
}
