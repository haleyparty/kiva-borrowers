// add commas as user types in input
$('#userInputToLend').keyup(function(event) {

  // skip for arrow keys and backspace
  if(event.which >= 37 && event.which <= 40) return;

  // format number
  $(this).val(function(index, value) {
    return value
    .replace(/\D/g, "")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });
});

// validate that user input is a positive number
var checkAmountToLend = function(amountToLend) {
  return amountToLend > 0;
};
