// ==UserScript==
// @name     ostjob.ch
// @description  Get the Job-ID and display it
// @version  3 2020.12.02
// @author marcel.eckstein@kssg.ch
// @match    https://www.ostjob.ch/firma/kantonsspital-st-gallen/3613*
// @match    https://neu.ostjob.ch/firma/kantonsspital-st-gallen/3613*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js
// ==/UserScript==

// clear structure to avoid reloading of the page after auth script
$('div.stats').remove();
$('#root > div').unwrap();
$('#root').unwrap();
$('body > div').unwrap();
// social media is not needed here
$('div.sticky-placeholder').remove(); 
// location structure is not needed here
$('div.company-vacancy-list').append($('a.vacancy-list-card__link-header'));
$('div.company-vacancy-group').remove();

// inject table for job ad list
$('div.company-details-card__container').replaceWith('<table id="MECtbl"><tr style="background-color: #a4d600">' +
  '<th>Job-ID</th><th>Titel</th><th>Ostjob Post-ID</th><th>Datum</th>' +
  '</tr></table>');
// iterate list and move to table
$('a.vacancy-list-card__link-header').each(function(){
  var title = $('.vacancy-list-card__title', this).text();
  var postHREF = $(this).attr('href');
  var postID = postHREF.replace(/.*\/(\d*)/, '$1');
  var postDatum = $('.vacancy-list-card__date', this).text();
	$('#MECtbl > tbody').append('<tr><td id="MECjobID' + postID + '">...</td><td>' + title + '</td><td><a href="' + postHREF + '">' + postID + '</a></td><td>' + postDatum +'</td></tr>');
  $(this).remove();
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.onreadystatechange = function(){
      console.log('xmlhttp.readyState ' + xmlhttp.readyState);
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      var dom = $(xmlhttp.responseText);
      console.log(xmlhttp.responseText);
      var jobID = dom.find('a.button.button--primary.button--block').attr('href').replace(/.*career_job_req_id=(\d+).*/, "$1");
      $('#MECjobID' + postID).html('<a href="https://career012.successfactors.eu/sfcareer/jobreqcareer?company=KSSG&jobId=' + jobID + '">' + jobID + '</a>');
    };
  }; 
  xmlhttp.open("GET", postHREF, false);
  xmlhttp.send();
});
//remove original list
$('div.company-vacancy-list').remove();
