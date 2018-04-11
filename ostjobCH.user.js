// ==UserScript==
// @name     ostjob.ch
// @description  Get the Job-ID and display it
// @version  1
// @match    https://www.ostjob.ch/firma/kantonsspital-st-gallen/3613*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
	
/*- The @grant directive is needed to work around a major design
    change introduced in GM 1.0.
    It restores the sandbox.
*/
/*
Tweak to your needs:
replace the @match directive with your company
replace the regex .*career_job_req_id=(\d+).* to what ever is needed to find your Job-ID in the apply URL
*/
var MECtbl = $('div.company-details__company-info').html('<table><tr>' +
                                            '<th>Job-ID</th><th>Titel</th><th>Ostjob Post-ID</th><th>Datum</th>' +
                                            '</tr></table>');

waitForKeyElements ('li.vacancy-list__vacancy-small-item', actionFunction);

function actionFunction(jNode){
  var title = $('h3 a', jNode).text();
  var postHREF = $('h3 a', jNode).attr('href');
  var postID = postHREF.replace(/.*\/(\d*)/, '$1');
  var postDatum = $('div.vacancy-small-item__date', jNode).text();
	MECtbl.find('tbody').append('<tr><td id="MECjobID' + postID + '"></td><td>' + title + '</td><td><a href="' + postHREF + '">' + postID + '</a></td><td>' + postDatum +'</td></tr>');
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      var dom = $(xmlhttp.responseText);
      var jobID = dom.find('div.vacancy-layout__action-links a.action-links__icon-email').attr('href').replace(/.*career_job_req_id=(\d+).*/, "$1");
      console.log(postID + " " + jobID);
      $('#MECjobID' + postID).html('<a href="https://career012.successfactors.eu/sfcareer/jobreqcareer?company=KSSG&jobId=' + jobID + '">' + jobID + '</a>');
    }
  }
  xmlhttp.open("GET", postHREF, false);
  xmlhttp.send();
}
