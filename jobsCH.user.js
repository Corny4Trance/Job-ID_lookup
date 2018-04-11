// ==UserScript==
// @name     jobs.ch
// @description  Get the Job-ID and display it
// @version  1
// @match    https://www.jobs.ch/de/firmen/3758-kantonsspital-st-gallen/stellenangebote/*
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

Usage Hint
jobs.ch paginates the listing. If you want copy the list you need to work thru all result pages
The script needs a hard reload of the listing page to trigger the lookup process. Comming from the company page the script will therefore not run.
*/


waitForKeyElements ('div.serp-item:has(div.matching-indicator)', actionFunction);

function actionFunction (jNode) {
  if($('div.box-head h2').length) 
    $('div.box-head').html('<table id="MECtbl"><tr>' +
                '<th style="border-right: 1px #e5e5e6 solid; padding: 5px;">Job-ID </th>' +
                '<th style="border-right: 1px #e5e5e6 solid; padding: 5px;">Titel</th>' +
                '<th style="border-right: 1px #e5e5e6 solid; padding: 5px;">JobsCH Post-ID</th>' +
                '<th style="border-right: 1px #e5e5e6 solid; padding: 5px;">Datum</th>' +
                '</tr></table>');
  var postID = jNode.attr("class").replace(/.*x--serp-item-(\d*) .*/, '$1');
  if($('#MEC_JobID' + postID).length == 0)
    $('#MECtbl tbody').append('<tr>' +
                '<td id="MEC_JobID' + postID + '" style="border-right: 1px #e5e5e6 solid; padding: 5px;"> ... <div id="MECtmp' + postID + '"></div></td>' +
                '<td style="border-right: 1px #e5e5e6 solid; padding: 5px;">' + jNode.find('h2').text() + '</td>' +
                '<td style="border-right: 1px #e5e5e6 solid; padding: 5px;"><a href="https://www.jobs.ch/de/stellenangebote/detail/' + postID + '" target="_blank">' + postID + '</td>' +
                '<td style="border-right: 1px #e5e5e6 solid; padding: 5px;">' + jNode.find('div.badge-pool span:first').text() + '</td>' +
                '</tr>');
  $('#MECtmp' + postID).load('https://www.jobs.ch/de/stellenangebote/detail/' + postID +' a.t--external-apply',
    function(response, status, xhr){
      var jobID = $('a', this).attr('href').replace(/.*career_job_req_id=(\d*).*/, '$1');
      var jobHREF= 'https://career012.successfactors.eu/sfcareer/jobreqcareer?company=KSSG&jobId=' + jobID;
      //console.log(postID + '\t' + jobID + '\t' + status);
      $('#MEC_JobID' + postID).html('<a href="' + jobHREF +'" target="_blank">' + jobID +'</a>');
    }
  );
  jNode.find('div.serp-item-content').remove();
  jNode.find('div.matching-indicator').remove();
}
