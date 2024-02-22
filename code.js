// FUNCTIONS RELATED TO MENU & SIDEBAR
// メニュー＆サイドバー関連の機能

function onOpen(e) {
  // Get the menu labels based on the user's language
  // ユーザーの言語に基づいてメニューのラベルを取得する
  let { settingsLabel, runLabel, aboutLabel } = setLabels();

  // Adds custom menus to the spreadsheet
  // カスタム メニューをスプレッドシートに追加する
  SpreadsheetApp.getUi()
    .createMenu(settingsLabel)
    .addItem(runLabel, 'mainFunction')
    .addSeparator()
    .addItem(aboutLabel, 'showAbout')
    .addToUi();
}

function setLabels() {
  // Set default labels
  // デフォルトのラベルを設定する
  let settingsLabel = 'Settings'
  let runLabel = '⏯ Run';
  let aboutLabel = 'ℹ︎ About';

  // If user's language is Japanese
  // ユーザーの言語が日本語の場合
  if (USER_LANGUAGE && USER_LANGUAGE.indexOf('ja') === 0) {
    settingsLabel = '設定'
    runLabel = '⏯ 実行';
    aboutLabel = 'ℹ︎ このツールについて';
  }

  return { settingsLabel, runLabel, aboutLabel };
}

// Utility function to include content from an HTML file into another HTML file
// HTML ファイルのコンテンツを別の HTML ファイルに含めるユーティリティ関数
function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Displays about page
// 「このツールについて」を表示する
function showAbout() {
  let dialogTitle = 'About This Utility';
  let htmlFileName = 'about_en';

  if (USER_LANGUAGE && USER_LANGUAGE.startsWith('ja')) {
    dialogTitle = 'このツールについて';
    htmlFileName = 'about_ja';
  }

  const htmlContent = HtmlService.createTemplateFromFile(htmlFileName)
    .evaluate()
    .setWidth(400)
    .setHeight(280);

  htmlContent.VERSION = VERSION;
  htmlContent.COPYRIGHT = COPYRIGHT;

  SpreadsheetApp.getUi().showModalDialog(htmlContent, dialogTitle);
}

// Displays execution logs
// 実行ログを表示する
function showSidebar(executionLogs) {
  let array = executionLogs.split('\n');
  let formattedOutput = array.map(line => `<p>${line.trim()}</p>`).join('');
  let sidebarTitle = 'Execution Log';

  if (USER_LANGUAGE && USER_LANGUAGE.startsWith('ja')) {
    sidebarTitle = '実行ログ';
  }

  let css = `
    <style>
      p {
        margin: 0;
        font-size: 12px; 
        font-family: Arial, sans-serif;
      }
    </style>
  `;
  
  const htmlContent = HtmlService.createHtmlOutput(css + formattedOutput)
    .setTitle(sidebarTitle);

  SpreadsheetApp.getUi().showSidebar(htmlContent);
}
