// ==UserScript==
// @name     jobs.ch
// @description  Get the Job-ID and display it
// @version  1 2018-07-07
// @match    https://www.jobs.ch/de/firmen/3758-kantonsspital-st-gallen/stellenangebote/*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
	
/*- The @grant directive is needed to work around a major design
    change introduced in GM 1.0.
    It restores the sandbox. */

// a part of the page dom is loaded twice. Once when received from jobs.ch and once after google tag manager and Krux (formerly jobs.ch was using hotjar) have responded.
// wait for this have finished
// waitForKeyElements('#_hjRemoteVarsFrame', actionFunction); //hotjar
waitForKeyElements('#kx-proxy-st5kwdon6', actionFunction); // Krux cdn.krxd.net

function actionFunction(jNode){
   // remove superfluous information 
  $('.matching-indicator').remove();
  $('.media-left').remove();
  $('.media-right').remove();
  $('.serp-item-head-2').remove();
  $('.serp-item-head-3').remove();
  
  // condens formatting
  $('.serp-item-content-inner').css("padding", "0px 5px");
  $('.serp-item-head-1').css("font-size", "1em").css("margin", "0");
  $('.serp-item-meta').css("padding", "0").css("margin", "0");
  $('.serp-item-job-info').css("min-height", "auto");
  
  
  // if there are own postings on the page
  if($('.serp-item:not(:has(.serp-item-info))').length){
    // add container table
    $('.box-head').css("padding", "0").html('<table id="MECtbl"><tr style="background-color: #a4d600">' +
                                                '<th>Job-ID</th><th>Titel</th><th>jobs.ch Post-ID</th><th>Datum</th>' +
                                                '</tr></table>'); 

    // skip postings found on other platforms
    $('.serp-item:not(:has(.serp-item-info))').css("background-color", "#a4d600").each(function(){
      var title = $('h2 a', this).text();
      var postDatum = $('.badge:first span', this).text();
      var postHREF = $('h2 a', this).attr('href');
      postHREF = (postHREF.split("?"))[0];
      var postID = postHREF.replace(/.*detail\/(\d*)\/.*/, '$1');
      $('#MECtbl').append('<tr><td id="MECjobID' + postID + '"></td><td>' + title + '</td><td><a href="' + postHREF + '">' + postID + '</a></td><td>' + postDatum +'</td></tr>');
      this.remove(); // the original entry is removed after having been duplicated to the container table
      var xmlhttp = new XMLHttpRequest(); 
      xmlhttp.onreadystatechange = function(){
       if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
          var dom = $(xmlhttp.responseText);
          var jobID = dom.find('a.t--external-apply').attr('href').replace(/.*career_job_req_id=(\d+).*/, "$1");
          $('#MECjobID' + postID).html('<a href="https://career012.successfactors.eu/sfcareer/jobreqcareer?company=KSSG&jobId=' + jobID + '">' + jobID + '</a>');
        }
      }
      xmlhttp.open("GET", postHREF, false);
      //console.log(postID + " aufgerufen mit " + postHREF);
      xmlhttp.send();
    })
	}

  // prevent events on the pagination links
  $('ul.pagination a').each(function(){
    //duplicate original link and remove it afterwards
    $(this).after('<a href="' + $(this).attr("href") + '">' + $(this).html() + '</a>');
    this.remove();
  });
} 
