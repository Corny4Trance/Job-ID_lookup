// ==UserScript==
// @name     jobs.ch
// @description  Get the Job-ID from a SAP SF target system and display it
// @version  2 2020-04-25
// @match    https://www.jobs.ch/de/firmen/3758-kantonsspital-st-gallen/stellenangebote/*
// @match    https://www.jobs.ch/de/firmen/11393-universitaetsspital-zuerich/stellenangebote/*
// @match    https://www.jobs.ch/de/firmen/21347-universitaetsspital-basel/stellenangebote/*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
	
/*- The @grant directive is needed to work around a major design
    change introduced in GM 1.0.
    It restores the sandbox. */



// a part of the page dom is loaded twice. Once when received from jobs.ch and once after google tag manager and Bing's Bat (formerly jobs.ch was using Krux cdn.krxd.net and even before hotjar) have responded.
// wait for this have finished
// waitForKeyElements('#_hjRemoteVarsFrame', actionFunction); //hotjar
//waitForKeyElements('#kx-proxy-st5kwdon6', actionFunction); // Krux cdn.krxd.net
waitForKeyElements("div[id^='batBeacon']", actionFunction); // bat.bing.com


function actionFunction(jNode){
  // remove superfluous information
  $("div[id^='batBeacon']").remove();
  $('div[data-cy="company-vacancies"] hr:first').prevAll().remove();  
  $('div[data-cy="serp-item"] h2').nextAll().remove();  
  
  // condens formatting
  $('div[data-cy="serp-item"]').css({"padding":"revert","min-height":"revert"});  
  $('div[data-cy="serp-item"] div').css({"padding":"0","min-height":"0"});  

  // if there are company postings on the page
  if($('div[data-cy="company-vacancies"] a[data-cy="company-link"]').length){
    // remove superfluous information
    $('div[data-cy="company-vacancies"] hr:first').prevAll().remove();
    // add container table
    $('div[data-cy="company-vacancies"]').prepend('<table id="MECtbl" style="width:100%"><tr style="background-color: #a4d600">' +
                                                '<th>Job-ID</th><th>Titel</th><th>jobs.ch Post-ID</th><th>Datum</th>' +
                                                '</tr></table>'); 
    $('div[data-cy="serp-item"]').has('a[data-cy="company-link"]').each(function(){
      var title = $('h3 a', this).text();
      var postHREF = $('h3 a', this).attr('href');
      var postDatum = $('div:last > span > span', this).text();
      postHREF = (postHREF.split("?"))[0];
      var postID = postHREF.replace(/.*detail\/(\d*)\/.*/, '$1');
      $('#MECtbl').append('<tr><td id="MECjobID' + postID + '"></td><td>' + title + '</td><td><a href="' + postHREF + '">' + postID + '</a></td><td>' + postDatum +'</td></tr>');
      this.remove(); // the original entry is removed after content has been moved to the container table
      //get the individual post
      var xmlhttp = new XMLHttpRequest(); 
      xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
          var url = $(xmlhttp.responseText).find('#vacancydetailhead a[href^="https://career012.successfactors.eu"]').attr('href');
          console.log(url);
          var re = /company=([a-z]+)/i;
          var company = re.exec(url);
          re = /[career_job_req_id|jobId]=(\d+)/;
          var jobID = re.exec(url);
          $('#MECjobID' + postID).html('<a href="https://career012.successfactors.eu/sfcareer/jobreqcareer?company=' + company[1] + '&jobId=' + jobID[1] + '">' + jobID[1] + '</a>');
         
        }
      };
      xmlhttp.open("GET", postHREF);
      xmlhttp.send()
    })
  }
  // prevent events on the pagination links
  $('ul.pagination a').each(function(){
    //duplicate original link and remove it afterwards
    $(this).after('<a href="' + $(this).attr("href") + '">' + $(this).html() + '</a>');
    this.remove();
  });
}
