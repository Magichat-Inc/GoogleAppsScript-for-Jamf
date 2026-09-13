// USED STRING LITERALS
// 使用する文字列
const VERSION = '3.0.0';
const COPYRIGHT = '© 2026 Magic Hat Inc. All rights reserved.';
const PRODUCT_NAME = 'Mass Update on Google Sheets';

// LOG MESSAGES
const LOG_MESSAGES = {
  MISSING_PROPERTIES: {
    en: 'Required variables are missing. Check Project Settings > Properties.',
    ja: '必要な変数が設定されていません。プロジェクト設定 > プロパティを確認してください。'
  },

  MISSING_SHEET: {
    en: `Sheet "${SHEET_NAME}" not found.`,
    ja: `シート「${SHEET_NAME}」が見つかりませんでした。`
  },

  MISSING_LOG_SHEET: {
    en: `Sheet "${ERROR_LOG}" not found.`,
    ja: `シート「${ERROR_LOG}」が見つかりませんでした。`
  },

  ACCESS_TOKEN_SUCCESS: {
    en: 'Access token acquired',
    ja: 'アクセストークン取得完了'
  },

  BEARER_TOKEN_SUCCESS: {
    en: 'Bearer token acquired',
    ja: 'Bearerトークン取得完了'
  },

  REQUEST_FAILED: {
    en: 'Request failed. Response code: ',
    ja: 'リクエスト失敗。レスポンスコード: '
  },

  TOKEN_VALID: {
    en: 'Existing token is still valid',
    ja: '既存のトークンはまだ有効です。'
  },

  TOKEN_INVALID: {
    en: 'Existing token is invalid',
    ja: '既存のトークンは無効です。'
  },

  TOKEN_INVALIDATED: {
    en: 'Jamf API token invalidated',
    ja: 'Jamf APIトークン無効化完了'
  },

  PROCESSING_DEVICE: {
    en: 'Processing device',
    ja: 'デバイス処理中'
  },

  MOBILE_DEVICE_ID: {
    en: 'Get mobile device ID',
    ja: 'モバイルデバイスIDの取得'
  },

  DISPLAY_NAME: {
    en: 'Update device display name',
    ja: 'モバイルデバイス名の変更'
  },

  ENFORCE_NAME: {
    en: 'Enforce device name setting',
    ja: 'モバイルデバイス名の強制設定'
  },

  INVENTORY_ITEMS: {
    en: 'Update inventory items',
    ja: 'その他のインベントリ項目の更新'
  },

  INVENTORY_UPDATE_FINISHED: {
    en: '** ALL DEVICES PROCESSED **',
    ja: '** 全てのデバイスの処理が完了しました **'
  }
};
