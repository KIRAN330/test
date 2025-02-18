 // Set the work date to today's date
 document.getElementById("work-date").valueAsDate = new Date();

 // Cache for product names
 let productNameCache = {};

 // Add event listener for product code input
 document.getElementById("product-code").addEventListener("input", function () {
     let productCode = this.value.trim();
     if (productCode !== "") {
         document.getElementById("product-name-loading").style.display = "block";
         if (productNameCache[productCode]) {
             document.getElementById("product-name").value = productNameCache[productCode];
             document.getElementById("product-name-loading").style.display = "none";
         } else {
             google.script.run.withSuccessHandler(function(productName) {
                 productNameCache[productCode] = productName;
                 document.getElementById("product-name").value = productName;
                 document.getElementById("product-name-loading").style.display = "none";
             }).getProductName(productCode);
         }
     } else {
         document.getElementById("product-name").value = "";
         document.getElementById("product-name-loading").style.display = "none";
     }
 });

 // Function to sanitize numeric input by removing non-numeric characters
 function sanitizeNumericInput(input) {
     return input.replace(/[^0-9]/g, '');
 }

 // Function to format number with commas
 function formatNumberWithCommas(number) {
     return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
 }

 // Function to handle input formatting
 function handleNumericInput(input) {
     let cursorPosition = input.selectionStart;
     let sanitizedValue = sanitizeNumericInput(input.value);
     let formattedValue = formatNumberWithCommas(sanitizedValue);
     input.value = formattedValue;
     let newCursorPosition = cursorPosition + (formattedValue.length - input.value.length);
     input.setSelectionRange(newCursorPosition, newCursorPosition);
 }

 // Add event listeners for all numeric inputs
 document.querySelectorAll('.numeric-input').forEach(input => {
     input.addEventListener('input', function() {
         handleNumericInput(this);

         // Trigger calculations based on the input field
         if (this.id === 'target-quantity' || this.id === 'shot-quantity') {
             calculateScheduledTime();
         } else if (this.id === 'actual-quantity' || this.id === 'price') {
             calculateTotal();
         } else if (this.id === 'b26' || this.id === 'd26' || this.id === 'f26' || this.id === 'h26' || this.id === 'j26') {
             calculateNonOperationalTime();
         }
     });

     input.addEventListener('keypress', function (e) {
         let char = String.fromCharCode(e.which);
         if (!/[0-9]/.test(char)) {
             e.preventDefault();
         }
     });
 });

 // Function to calculate scheduled time
 function calculateScheduledTime() {
     let targetQuantity = parseFloat(sanitizeNumericInput(document.getElementById("target-quantity").value)) || 0;
     let shotQuantity = parseFloat(sanitizeNumericInput(document.getElementById("shot-quantity").value)) || 0;
     if (shotQuantity !== 0) {
         let scheduledTime = targetQuantity / shotQuantity;
         document.getElementById("scheduled-time").value = scheduledTime.toFixed(0);
     } else {
         document.getElementById("scheduled-time").value = "";
     }
 }

 // Function to calculate total
 function calculateTotal() {
     let actualQuantity = parseFloat(sanitizeNumericInput(document.getElementById("actual-quantity").value)) || 0;
     let price = parseFloat(sanitizeNumericInput(document.getElementById("price").value)) || 0;
     let total = actualQuantity * price;
     document.getElementById("total").value = Math.round(total).toLocaleString();
 }

 // Function to calculate non-operational time
 function calculateNonOperationalTime() {
     let b26 = parseFloat(sanitizeNumericInput(document.getElementById("b26").value)) || 0;
     let d26 = parseFloat(sanitizeNumericInput(document.getElementById("d26").value)) || 0;
     let f26 = parseFloat(sanitizeNumericInput(document.getElementById("f26").value)) || 0;
     let h26 = parseFloat(sanitizeNumericInput(document.getElementById("h26").value)) || 0;
     let j26 = parseFloat(sanitizeNumericInput(document.getElementById("j26").value)) || 0;

     let totalNonOperationalTime = b26 + d26 + f26 + h26 + j26;
     document.getElementById("l26").value = totalNonOperationalTime;
 }

 // Initialize l26 when the page loads
 calculateNonOperationalTime();

 // Function to clear the form
 function clearForm() {
     document.getElementById("work-date").valueAsDate = new Date();
     document.getElementById("product-code").value = "";
     document.getElementById("product-name").value = "";
     document.getElementById("machine-number").value = "";
     document.getElementById("target-quantity").value = "";
     document.getElementById("shot-quantity").value = "";
     document.getElementById("scheduled-time").value = "";
     document.getElementById("actual-quantity").value = "";
     document.getElementById("unit-dropdown").value = "";
     document.getElementById("actual-time").value = "";
     document.getElementById("price").value = "";
     document.getElementById("total").value = "¥0";
     document.getElementById("remarks").value = "";
     document.getElementById("b26").value = "";
     document.getElementById("d26").value = "";
     document.getElementById("f26").value = "";
     document.getElementById("h26").value = "";
     document.getElementById("j26").value = "";
     document.getElementById("l26").value = "0";
 }

 // Form submission handler
 document.getElementById("submit-btn").addEventListener("click", function () {
     let isValid = true;
     let errorMessage = "";

     // Check for empty fields
     let requiredFields = [
         "product-code", "machine-number", "target-quantity", "shot-quantity",
         "actual-quantity", "actual-time", "price"
     ];
     requiredFields.forEach(fieldId => {
         let field = document.getElementById(fieldId);
         if (!field.value.trim()) {
             isValid = false;
             errorMessage = "未入力ところがあります";
             field.classList.add("error");
         } else {
             field.classList.remove("error");
         }
     });

     // Check for valid numbers in numeric fields
     let numericFields = [
         "target-quantity", "shot-quantity", "actual-quantity", "price",
         "b26", "d26", "f26", "h26", "j26"
     ];
     numericFields.forEach(fieldId => {
         let field = document.getElementById(fieldId);
         let value = parseFloat(field.value.replace(/,/g, ''));
         if (isNaN(value)) {
             isValid = false;
             errorMessage = "数値が無効です";
             field.classList.add("error");
         } else {
             field.classList.remove("error");
         }
     });

     if (!isValid) {
         swal({
             title: "エラー",
             text: errorMessage,
             icon: "error",
             button: "OK",
         });
         return;
     }

     // Proceed with form submission
     let formData = {
         workDate: document.getElementById("work-date").value,
         productCode: document.getElementById("product-code").value.trim(),
         productName: document.getElementById("product-name").value,
         machineNumber: document.getElementById("machine-number").value,
         targetQuantity: document.getElementById("target-quantity").value.replace(/,/g, ''),
         shotQuantity: document.getElementById("shot-quantity").value.replace(/,/g, ''),
         scheduledTime: document.getElementById("scheduled-time").value,
         actualQuantity: document.getElementById("actual-quantity").value.replace(/,/g, ''),
         unitDropdown: document.getElementById("unit-dropdown").value,
         actualTime: document.getElementById("actual-time").value.trim(),
         price: document.getElementById("price").value.replace(/,/g, ''),
         total: document.getElementById("total").value,
         remarks: document.getElementById("remarks").value,
         b26: parseFloat(document.getElementById("b26").value.replace(/,/g, '')) || 0,
         d26: parseFloat(document.getElementById("d26").value.replace(/,/g, '')) || 0,
         f26: parseFloat(document.getElementById("f26").value.replace(/,/g, '')) || 0,
         h26: parseFloat(document.getElementById("h26").value.replace(/,/g, '')) || 0,
         j26: parseFloat(document.getElementById("j26").value.replace(/,/g, '')) || 0,
         l26: parseFloat(document.getElementById("l26").value.replace(/,/g, '')) || 0
     };

     google.script.run.withSuccessHandler(function(response) {
         swal({
             title: "作業日報を送信完了しました！",
             text: response,
             icon: "success",
             button: "OK",
         }).then(() => {
             window.open("https://docs.google.com/spreadsheets/d/1WK-8MwTKh82N6BdwlpoiKsxmBOIiX5Nz7MPShidG-RU/edit?gid=676424636#gid=676424636", "_blank");
             clearForm();
         });
     }).withFailureHandler(function(error) {
         swal({
             title: "エラー",
             text: "フォームの送信中にエラーが発生しました: " + error.message,
             icon: "error",
             button: "OK",
         });
     }).submitForm(formData);
 });