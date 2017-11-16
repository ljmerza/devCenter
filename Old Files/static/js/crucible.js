// on doc ready
$(document).ready(function(){
  let data = { attuid: 'lm240n', password: 'Strong@rm', crucible_id: 'CR-UD-3355'};

	$.ajax({
    type: 'POST',
    url: `/crucible/review/pcr_pass/`,
    data: JSON.stringify(data),
    contentType: 'application/json;charset=UTF-8',

  })
  .then( data => {
      console.log('crucibleData: ', data);
  });

});
