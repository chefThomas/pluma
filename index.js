

function handleSubmit() {
  $('form').on('click', 'input#submit-button', event => {
    event.preventDefault();
    console.log($('.user-input').val())
  })
}


function autocomplete() {
  $('.user-input').autocomplete({
    minLength: 3,
    source: renamedKeys
  })


  // $('form').on('keyup', '.user-input', event => {


  //   // // // user text 
  //   const textContent = $('.user-input').val();
  //   console.log(textContent);

  //   const testPattern = new RegExp(textContent, "i");

  //   const result = trimmedSpecies.find(species => {
  //     return testPattern.test(species.commonName);
  //   })

  //   console.log(result);
  // })

}


$(autocomplete)
$(handleSubmit)