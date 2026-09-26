// FUNCTIONS RELATED TO MENU & LOCALIZATION
// メニュー関連の機能 & ローカリゼーション

function onOpen(e) {
  // Get the menu labels based on the user's language
  // ユーザーの言語に基づいてメニューのラベルを取得する
  const { menuLabel, runLabel, aboutLabel } = setLabels();

  // Adds custom menus to the spreadsheet
  // カスタム メニューをスプレッドシートに追加する
  SpreadsheetApp.getUi()
    .createMenu(menuLabel)
    .addItem(runLabel, 'mainFunction')
    .addSeparator()
    .addItem(aboutLabel, 'showAbout')
    .addToUi();
}

function isJapaneseUser() {
  return USER_LANGUAGE && USER_LANGUAGE.startsWith('ja');
}

function setLabels() {
  // Set default labels
  // デフォルトのラベルを設定する
  let menuLabel = 'Mass Update Tool';
  let runLabel = '⏯ Run';
  let aboutLabel = 'ℹ︎ About';

  // If user's language is Japanese
  // ユーザーの言語が日本語の場合
  if (isJapaneseUser()) {
    menuLabel = 'Jamf Pro一括更新ツール';
    runLabel = '⏯ 実行';
    aboutLabel = 'ℹ︎ このツールについて';
  }

  return { menuLabel, runLabel, aboutLabel };
}

// Utility function to include content from an HTML file into another HTML file
// HTML ファイルのコンテンツを別の HTML ファイルに含めるユーティリティ関数
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Displays about page
// 「このツールについて」を表示する
function showAbout() {
  let dialogTitle = 'About This Utility';
  let htmlFileName = 'about_en';
  let height = 190;

  if (isJapaneseUser()) {
    dialogTitle = 'このツールについて';
    htmlFileName = 'about_ja';
    height = 250;
  }

  const template = HtmlService.createTemplateFromFile(htmlFileName);
  template.VERSION = VERSION;
  template.COPYRIGHT = COPYRIGHT;
  template.PRODUCT_NAME = PRODUCT_NAME;

  const htmlContent = template.evaluate()
    .setWidth(400)
    .setHeight(height);

  SpreadsheetApp.getUi().showModalDialog(htmlContent, dialogTitle);
}

function getLocalizedMessage(key) {
  const lang = isJapaneseUser() ? 'ja' : 'en';

  if (!LOG_MESSAGES[key]) {
    return key;
  }

  return LOG_MESSAGES[key][lang] || LOG_MESSAGES[key].en;
}
