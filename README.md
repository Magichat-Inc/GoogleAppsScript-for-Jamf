# GoogleAppsScript-for-Jamf
このプログラムは、スプレッドシート、Google Apps Script および Jamf Pro の API の組み合わせを利用します。  
スプレッドシート内の情報に基づいて、プログラムは API 呼び出しを行い、ユーザーが指定した Jamf Pro インスタンス内の関連情報を更新します。

**アップデートが意図したとおりに機能することを確認するために、最初は必ず数台のデバイスのみでテスト更新を実行してください。**

- [Introduction](#introduction)
- [Beginning Steps](#beginning-steps)
  - [Google Account](#google-account)   
  - [Jamf Pro](#jamf-pro)
    - [Basic Authorization](#basic-authorization)
    - [API Account](#api-account)
  - [Google Spreadsheet](#google-spreadsheet)
    - [Make A Copy](#make-a-copy)
    - [Initial Settings](#initial-settings)
- [Data Input](#data-input)
  - [Updating Attributes](#updating-attributes)
  - [Updating Extension Attributes](#updating-extension-attributes)
  - [Clearing Existing Attributes](#clearing-existing-attributes)
- [First Run](#first-run)
- [Mass Updating](#mass-updating)

## [Introduction](#introduction)
この一括更新ツールは、Webアプリケーション フレームワークである Google Apps Script(GAS) の下で JavaScript で書かれた Web アプリケーションです。これにより、Jamf 管理者は、Jamf 内のデバイス (iOS、iPadOS、tvOS 対象のみ) およびユーザーの属性 (ユーザー名、アセットタグ、または拡張属性など) を一括更新できます。 

ツールはブラウザー上で動きますので、OSと関係なく、Windows、macOS、iOS デバイスでも使うことは可能となります。

![メインシート](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-zbboHMtTv4-9HEI8tVBPIPrWJDW5_gyK5K2l7hrXqOG6k4Afdf-TIOOMkwFq7N_4FqPTOauHDciw5jKgesjqKG59nP=w2848-h1668 "メインシート")

## [Beginning Steps](#beginning-steps)
このツールを使用するには、以下の手順を該当する順序で事前準備を行ってください。
### [Google Account](#google-account)
https://www.google.com/accounts/NewAccount にアクセスします。​指示に従ってアカウントを作成してください。
※既にアカウントをお持ちの場合は、新しいアカウントを作成する必要はありません。​[参照](https://support.google.com/accounts/answer/27441?hl=ja&ref_topic=3382296&sjid=12686068683038764892-AP​)

Googleアカウントにログインします。

### [Jamf Pro](#jamf-pro)
お使いの Jamf Proにおいて 初めて当作業を実施する際は以下を実施してください。

#### [Basic Authorization](#basic-authentication)
![Basic認証許可](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-zaXjF1evr30IGrtAMhW79-tOzgX8wi_Nl9RM30bXmGHEvs48R3E8rED8JQHS3d6_VVuKRFtfT97nsnUgjb-PvRF2DsBw=w2848-h1668 "Basic認証許可")

#### [API Account](#api-account)
Jamf Pro で API用ユーザアカウントを以下の様に作成します。

1. 画面右上の「⻭車マーク」をクリック。
2. 「Jamf Proユーザアカウントとグループ」をクリック。 
3. 画面右上の「新規」をクリック。 
4. 「Create Standard Account」に チェック、次へ押下。
5. アカウントタブにて以下を設定してください。
   - ユーザ名(例）：api-user
   - アクセスレベル：フルアクセス
   - 権限セット：カスタム
   - パスワード

![API用アカウント](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-zDZK9pOjH8Y9jAbX56EThbJPogQ2hBd0vpMdHNIgCICajV4-XpA2hrZiOBu0hzEstdP18mc1g9mlMUicS6Q2ikTSvu=w2848-h1668 "API用アカウント")

6. 権限タブにて以下にチェックを付けてください。
   - **Jamf Proサーバオブジェクト**
     - Mobile Devices (作成・読み取り・アップデート）
     - ユーザ (読み取り・アップデート）
   - **Jamf Proサーバアクション**
     - モバイルデバイスへのユーザ割当
     - モバイルデバイス名称設定コマンドを送信
7. 「保存」をクリック。

### [Google Spreadsheet](#google-spreadsheet)

#### [Make A Copy](#make-a-copy)
1. 以下リンクにアクセス。
   - https://docs.google.com/spreadsheets/d/1fTqvaqtE9LxwskzQJHS6nNf19dpdizMRXHypr9010ak
2. ファイル > コピーを作成 にクリック。
3. ドキュメントをコピーのプップアップの設定。
   - 名前：変更可能
   - Apps Script ファイル：一括更新を動くために、スクリプトを使います。スクリプトを確認したい場合、クリックするとコードが開けます。
   - フォルダ：マイドライブ（そのままにしてください。）
4. 「 コピーを作成」にクリック。
5. コピーしたスプレッドシートは自動的に新しいタブで開けます。  
※ 使用しているGoogleアカウントのドライブにスプレッドシートは保存されますので、今後ドライブから開くことができます。

![スプレッドシートのコピー](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-wGQ6qYW5zpjKshne7DdX_sZyQUkreLQymRzNPY5Cwr2pR_RzD8G1RnkHfCqE1Iopq15Yrh7wY6kQ0oU1NPkJCh0V4rGA=w2850-h1668 "スプレッドシートのコピー")

#### [Initial Settings](#initial-settings)
コピーしたスプレッドシートを開いて、以下の手順にそって初期設定を行ってください。

1. 拡張属性 > Apps Script にクリック。
2. 画面左中の「歯車マーク」をクリック。（プロジェクトの設定）
3. 下にある「スクリプト プロパティを追加」にクリック。
4. 以下の内容を設定して「保存」をクリック。

| プロパティ | 値 |
| :---   | :---   |
| CLASSIC_API_URL | https://インスタンス名.jamfcloud.com/JSSResource |
| JAMF_PRO_API_URL | https://インスタンス名.jamfcloud.com/api/ |
| CREDENTIALS | 作成したJamfAPIユーザー名:Jamfパスワード<br />例: ユーザー名がaaa、パスワードがbbbであれば<br />「aaa:bbb」となる。 |
| SHEET_NAME | MobileDeviceTemplate |
| SPREADSHEET_ID | コピーしたスプレッドシートID (取得方は以下の説明をご覧） |

スプレッドシート ID は URL から抽出できます。  
例えば、URLは https://docs.google.com/spreadsheets/d/abc1234567/edit#gid=0 の場合、 
スプレッドシート ID は「abc1234567」となります。

![スプレッドシートの初期設定](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-zlH3NxuyE5gQkIstLLRhg5ToMgKBN0akjJWfLeFd7Vl4wuZUNwsHA0-INSqmyWmzcKjJkGJNDZLe4g0U9L9uwzfg6WHg=w2850-h1668 "スプレッドシートの初期設定")

## [Data Input](#data-input)
![データ入力](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-y40QvB7i9812mPvx87-YGfy9RP8eLN_CyPRRJ3FdsqprfRhcJbXbIoy0dg0Ci0Oq8rl2DzssUNnP3CK2L5AYXtBZtTWA=w2850-h1668 "データ入力")

一括更新を実行する時に、スプレッドシートのヘッダー行に対して検証チェックを実行します。一括更新を行う前に、ヘッダー行の変更 (列の削除や列の再配置など) しないようにしてください。 ヘッダー行に変更があれば、一括購入は正常に動かない可能性は高いです。

スプレッドシートの下にあるシート名「MobileDeviceTemplate」をそのままにしてください。
![スプレッドシート名](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-xSUzDQtk-nU37w413lfhTOeSIPGI1SwQVhz4446MLRzygnsvCU-MvxMYPj2jZGLufu5Dij0JnY0gfcPsZlG0YwmwT-TQ=w2850-h1668 "スプレッドシート名")

### [Updating Attributes](#updating-attributes)
スプレッドシートにある客ヘッダ名の使い方についてです。

- Mobile Device Serial [入力必須]
  - インベントリ情報を更新したいデバイスのシリアルナンバーを半角英数文字で入力する。 

**Jamf Pro にてインベントリ画面の「一般」タブで更新可能な項目**
- Display Name:「モバイルデバイス名」(実機のデバイス名も更新される)  
- Enforce Name:「モバイルデバイス名を強制する」
  - ユーザによってデバイス名が変更された場合、モバイルデバイス名は入力された値に戻る
  - 指定値に戻す →「TRUE」or そのままにする →「FALSE」
- Asset Tag:「アセットタグ」  
- Site:「サイト」
  - ID or サイト名
  - Jamf Pro に登録されていない「サイト」を入力した場合は更新されない。
- AirPlay Password (tvOS):「AirPlay パスワード」

**Jamf Pro にてインベントリ画面の「ユーザと位置」タブで更新可能な項目**
- Username:「ユーザ名」
- Real Name:「氏名」
- Email Address:「Ｅメールアドレス」
- Position:「ポジション」
- Phone Number:「電話番号」
- Department:「部署」
- Building:「建物」
- Room:「ルーム」

【注意事項】  
Department、Building については、Jamf Pro に登録されている  
 「部署」「建物」と同じ値 (文字列) を入力する必要がある。  
 Jamf Pro に登録されていない「部署」「建物」を入力した場合は更新されない。 

**Jamf Pro にてインベントリ画面の「購入」タブで更新可能な項目**
- PO Number:「購入番号」
- Vendor:「ベンダー」
- Purchase Price:「購入価格」
- PO Date:「購入日」
  - yyyy-mm-dd形
- Warranty Expires:「品質保証期限電」
  - yyyy-mm-dd形
- Is Leased:「購入またはリース」
  - 指定値に戻す →「TRUE」or そのままにする →「FALSE」
- Lease Expires:「リース有効期限」
  - yyyy-mm-dd形
- AppleCare ID:「AppleCare ID」

### [Updating Extension Attributes](#updating-extension-attributes)  
デバイス用の拡張属性を更新するのは可能です。  
まず拡張属性の ID を特定する必要があります。

1. Jamf Pro の GUI で歯車アイコンをクリック。
2. デバイス管理 > 拡張属性を選択。
3. 更新する EA をクリック。
4. 該当 EA の URL から ID を取得する。

例えば、ここで表示されている拡張属性のEA IDは「17」です。
![スプレッドシート名](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-z-pk9ZZipPjBklE_i0K6oDaPeqBSDwbmFjMP84pH_cN9RM9hgYO7R_Fc_NgbuCJNtQVjB9GGMvkFYNQ2RpVf-TDeoQQQ=w2854-h1668 "スプレッドシート名")

拡張属性を更新するには、テンプレートの既存のすべての列の後に新しい列に独自のヘッダーを追加し、そのヘッダーに文字列「EA_#」を入力します。「#」は更新する EA の ID です。

たとえば、ID が「17」の拡張属性を更新するには、ヘッダーが「EA_17」の新しい列を追加し、その EA の値をその列に配置します。

スプレッドシートは次のようになります。  
(適合させるために一部の列が表示されていません。スプレッドシートから列を削除しないでください)。

| Mobile Device Serial | Display Name | Enforce Name | Asset Tag | ... | Site (ID or Name) | EA_17 | EA_18
| :---   | :---   |  :---   |  :---   |  :---   |  :---   |  :---  |  :---   |
| A1234567 | | TRUE | MH-12 | | | New Value | New Value |
| B1234567 | | FALSE | MH-15 | | | New Value | New Value |

### [Clearing Existing Attributes](#clearing-existing-attributes)  
ツールのもう 1 つの機能として、既存の属性をクリアすることはできます。  
たとえば、デバイスのグループが新しいユーザーに再配布されるか、廃止され、ユーザー名と関連情報を削除する必要がある場合に発生します。

値をクリアするには、特定の文字列を使用する必要があります。  
この文字列は現在「CLEAR!」です。

【注意事項】  
・ Display Name、Is Leased、PO Date、Warranty Expires、Lease Expires は対象外。

デバイスからユーザー情報を消去する場合、スプレッドシートは次のようになります (省略記号の後に列があります)。

| Mobile Device Serial | Display Name | Enforce Name | Asset Tag | ... | Site (ID or Name) | EA_17 | EA_18
| :---   | :---   |  :---   |  :---   |  :---   |  :---   |  :---  |  :---   |
| A1234567 | | CLEAR! | CLEAR! | | CLEAR! | CLEAR! | CLEAR! |
| B1234567 | | CLEAR! | CLEAR! | | CLEAR! | CLEAR! | CLEAR! |

## [First Run](#first-run)
1. コピーしたスプレッドシートを開く。
2. 更新したいデータを入力する。
3. メニューでヘルプの右にある Settings > Run を押下。
4. 「Create Standard Account」に チェック、次へ押下。

![最初の実行](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-xoelBTPSky9Xe_Sj4biRLX9lb4UnQgYh4e_QXpvwodrOaihCPEvXQnfvHaFkZNuxbU06kKtYwyLAbkf4g2GtnUF7iMaQ=w2854-h1668 "最初の実行")

5. 最初実行時に承認が必要。（写真参照）  
  「続行」ボタンをクリック。

![「承認が必要」ポップアップ](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-w_24DmZL0UDrGyDz-kygZaoyWQj3-9VC3hywMC-4HkQV76-fUM7knUTOaV3-3iwQz4ysfI1m5fZHHqLIm8GJXCe_C8_g=w2854-h1668 "「承認が必要」ポップアップ")
  
  Googleアカウント選択。  
  「このアプリは Google で確認されていません」出た時に詳細」をクリック。

![「このアプリは Google で確認されていません」ポップアップ](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-y4r96nFvdHYjpXTFoyLBR6R_8H8h5fg1iX_iZy5jWvtUKHNJ0IQ75CtklY0sFrGcPiKe778iywxUBp-EEiFZkPRsjoXg=w2854-h1668 "「このアプリは Google で確認されていません」ポップアップ")

 「詳細」クリック後に「[GAS] MobileDeviceTemplate (安全ではないページ) に移動」をクリック。

 ![「移動」ポップアップ](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-y6uh3xIk5mECCDaWcFrUSduSP42CP7kqAT0d-xG2myZEJfYtzn4V8gYzoK45Y-jK-Kuy9MzcXH7Myxo3YzL7fbu9tRcQ=w2854-h1668 "「移動」ポップアップ")

最後に「許可」を押下。

![「許可」ポップアップ](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-w3B3Su2tvxxeym_HuviqzVZEg_FaDthMzTPzi6NSYZHD7w2JVNJaxaVtvsPM8I2gYEIZCbmbqGPQLF0NptzV5gS8nN=w2854-h1668 "「許可」ポップアップ")

## [Mass Updating](#mass-updating)
1. コピーしたスプレッドシートを開く。
2. 更新したいデータを入力する。
3. メニューでヘルプの右にある Settings > Run を押下。
4. 「Create Standard Account」にチェック、次へ押下。

![プログラム実行](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-xoelBTPSky9Xe_Sj4biRLX9lb4UnQgYh4e_QXpvwodrOaihCPEvXQnfvHaFkZNuxbU06kKtYwyLAbkf4g2GtnUF7iMaQ=w2854-h1668 "プログラム実行")

更新中↓
![更新中](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-xjaobuuDVZjtSM0NYpJH7bpzcRyxLakahHBfMWcTbQYMOZ-pTH0miboAUxtiBc9jKeByDqjO4CX36c1O_-VG1YWjqzUw=w2854-h1668 "更新中")

更新完了したら、右にログのサイドバーが開きます。
更新完了↓
![更新完了](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-yuRfwBs-kz4r4uboIrDrT2FnLpiCjEq8mpZPIBEdmOhsgAq1TqNhumMTZIxJqncIE826y-CB4dL2raJk-nzXC8MrzsUg=w2854-h1668 "更新完了")

Settings > Run ボタンを押すと、ときどき以下のエラーとなります。
![エラー](https://lh3.googleusercontent.com/u/0/drive-viewer/AITFw-wRIzreDfz55PClqdnukcIakVDfSrXVPTrj8QUWKhFvhg06LuuLFOI8OnheeUyUUqPs2L7p-7IAbb_Q8eoJhKBjcDo5lg=w2854-h1668 "エラー")
この場合、以下をやってみてください。  
「表示しない」をクリック。  
5-10秒を待つ。  
Settings > Run をもう一度押下。  