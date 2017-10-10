// on doc ready
$(document).ready(function(){

  // change event for repo selection
  $(".repositoryName").change(getRepoBranches);
  $("#createReview").click(createNewCrucible);

   // $(document).ready(function() {
   //    $("#qaSteps").markItUp();
   // });

});

function getRepoBranches() {
  // hide branch dropdowns and get new repo
  // 
  let branchParent = $(this).parent().parent().children('.branchDropdownParent');

  $(branchParent).invisible();

  let repo = $(this).val().toLowerCase().replace(' ', '_');

  $.get(`/git/repo/${repo}`)
  .then( branches => {

    let count = 0

    // for each dropdown add branches
    $(branchParent).find('.baseBranch, .reviewedBranch').empty().each( function() {
      let defaultOption = 'Review Branch';
      let customBranches = branches.slice();

      // if even element then only add base branches
      if(++count % 2 == 0){
        defaultOption = 'Base Branch';
        customBranches = customBranches.filter( branch => {
          return branch.length < 16;
        });
      } else {
        customBranches = customBranches.filter( branch => {
          return branch.length > 16;
        });
      }


      $(this).append(`<option value="">${defaultOption}</option>`);
      // for each branch add option element
      customBranches.forEach( branch => {

        $(this).append(`<option value="${branch}">${branch}</option>`);
      });
    });

    // show each dropdown
    $(branchParent).each( function() {
      $(this).visible();
    });
  });
}


function createNewCrucible() {
  let data = {}
  data.repos = []

  let repoDropdownParent = $('.repoDropdownParent');

  // get data from each repo added
  repoDropdownParent.each( function() {

    // get repo details
    let repositoryName = $(this).find('.repositoryName').val();
    let reviewedBranch = $(this).find('.reviewedBranch').val();
    let baseBranch = $(this).find('.baseBranch').val();

    // if values exist for all three then add to ajax data
    if(repositoryName && reviewedBranch && baseBranch){
      // format repo name
      repositoryName = repositoryName.toLowerCase().replace(' ', '_');

      // add repo
      data.repos.push({
        "repositoryName": repositoryName,
        "baseBranch": baseBranch,
        "reviewedBranch": reviewedBranch
      });
    }
  });

  // add data
  data.attuid = $('#attuid').val();
  data.password = $('#password').val();
  data.qa_steps = $('#qaSteps').val();
  data.autoPCR = $('#autoPCR').is(':checked');
  data.autoCR = $('#autoCR').is(':checked');

  // get log time and if exists parse it
  const log_time = $('#logTime').val();
  let time_logged_minutes = 0;
  if(log_time){
    
    

    // for each section of logged time add it up to seconds
    log_time.split(' ').forEach( time_section => {

    	const time = parseInt( time_section.slice(0, time_section.length) );

      	if( /[0-9]d/.test(time_section) ){
        	time_logged_minutes += 24*60*time;

      	} else if( /[0-9]h/.test(time_section) ){
        	time_logged_minutes += 60*time;

      	} else if( /[0-9]m/.test(time_section) ){
        	time_logged_minutes += time;
      	}

    });

    // make sure we have a number
    if( isNaN(time_logged_minutes) ) { createNotification('Work log is not in the correct format.'); return;}

    // finally save for backend
    
  }

  data.log_time = time_logged_minutes;
  

  // check for missing data
  if(!data.attuid) { createNotification('Missing attuid.'); return;}
  if(!data.password) { createNotification('Missing password.'); return;}
  if(data.repos.length < 1) { createNotification('Need to include at least one repo.'); return;}  
  if(!data.qa_steps) { createNotification('Missing QA steps. Will not post any information to Jira.');}

  $.ajax({
    type: 'POST',
    url: `/crucible/review/create/`,
    data: JSON.stringify(data),
    contentType: 'application/json;charset=UTF-8',

  })
  .then( data => {
    if( data.status.match(/ERROR/) ) createNotification(data.response);
    else {

      createNotification(`Success! 
        <a href='https://icode3.web.att.com/cru/${data.response}'>Crucible</a> 
        <a href='${data.jira_link}'>Jira</a>`
      ,'success', 0);

      $('#attuid').val('');
      $('#password').val('');
      $('#qaSteps').val('');

      $(this).find('repoDropdownParent .reviewedBranch').val('');
      $(this).find('repoDropdownParent .repositoryName').val('');

    }
   
  });
}





jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

jQuery.fn.visibilityToggle = function() {
    return this.css('visibility', function(i, visibility) {
        return (visibility == 'visible') ? 'hidden' : 'visible';
    });
};



function createNotification(message, type, timeout){
  new Noty({
    type: type || 'warning',
    layout: 'topRight',
    theme: 'mint',
    text: message || 'No message supplied',
    timeout: timeout || 5000,
    progressBar: true,
    closeWith: ['click', 'button'],
    animation: {
      open: 'noty_effects_open',
      close: 'noty_effects_close'
    },
    id: false,
    force: false,
    killer: false,
    queue: 'global',
    container: false,
    buttons: [],
    sounds: {
      sources: [],
      volume: 1,
      conditions: []
    },
    titleCount: {
      conditions: []
    },
    modal: false
  }).show()
}