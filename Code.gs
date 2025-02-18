function doGet() {
  return HtmlService.createHtmlOutputFromFile("FORM").setTitle("作業日報");
}

// Function to fetch product name based on product code
function getProductName(productCode) {
  var sheet = SpreadsheetApp.openById("1WK-8MwTKh82N6BdwlpoiKsxmBOIiX5Nz7MPShidG-RU").getSheetByName("商品コードデータ保存");
  var data = sheet.getRange("A:B").getValues(); // Fetch product codes and names

  for (var i = 0; i < data.length; i++) {
    if (data[i][0] == productCode) { // Match product code
      return data[i][1]; // Return product name
    }
  }
  return "商品名が存在しません"; // Return if not found
}

// Function to submit form data to Google Sheets
function submitForm(formData) {
  var sheet = SpreadsheetApp.openById("1WK-8MwTKh82N6BdwlpoiKsxmBOIiX5Nz7MPShidG-RU").getSheetByName("データ一覧");

  var nameData = "キラン"; // Predefined name data

  // Append the form data along with the predefined name
  sheet.appendRow([
    nameData, // Add predefined name here
    formData.workDate,
    formData.productCode,
    formData.productName,
    formData.machineNumber,
    formData.targetQuantity,
    formData.shotQuantity,
    formData.scheduledTime,
    formData.actualQuantity,
    formData.unitDropdown,
    formData.actualTime,
    formData.price,
    formData.total,
    formData.b26,
    formData.d26,
    formData.f26,
    formData.h26,
    formData.j26,
    formData.l26,
    formData.remarks
  ]);

  return "データが送信されました！"; // Return a success message
}