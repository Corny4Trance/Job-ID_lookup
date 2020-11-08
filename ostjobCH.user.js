// ==UserScript==
// @name     ostjob.ch
// @description  Get the Job-ID and display it
// @version  3 2019-06-08
// @author marcel.eckstein@kssg.ch
// @match    https://www.ostjob.ch/firma/kantonsspital-st-gallen/3613*
// @match    https://neu.ostjob.ch/firma/kantonsspital-st-gallen/3613*
// @require  https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js
// @require  https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant    GM_addStyle
// ==/UserScript==
	
/*- The @grant directive is needed to work around a major design
    change introduced in GM 1.0.
    It restores the sandbox.
*/

// anchors for different ostjob versions
var versions = {
	"v2018" : {"container" : 'div.company-details__company-info', 
             "keyElement" : 'li.vacancy-list__vacancy-small-item',
             "postDate" : 'div.vacancy-small-item__date',
             "postingAd" : 'div.vacancy-layout__action-links a.action-links__icon-email'
            },
	"v2019" : {"container" : 'div.company-details-card__container', 
             "keyElement" : 'div.vacancy-list-card__body',  
             "postDate" : 'li.vacancy-list-card__date',
             "postingAd" : 'a.button.button--primary.button--block'
            }
};

// check Ostjob platform release
var version = "unknown";
if($(versions.v2018.container).length) version = versions.v2018;
if($(versions.v2019.container).length) version = versions.v2019;
if(version === "unknown") alert("Kann Ostjob Version nicht erkennen !");

// inject table for job ad list
var MECtbl = $(version.container).html('<table><tr style="background-color: #a4d600">' +
                                            '<th>Job-ID</th><th>Titel</th><th>Ostjob Post-ID</th><th>Datum</th>' +
                                            '</tr></table>');

waitForKeyElements (version.keyElement, actionFunction);

function actionFunction(jNode){
  var title = $('h2 a', jNode).text();
  var postHREF = $('h2 a', jNode).attr('href');
  var postID = postHREF.replace(/.*\/(\d*)/, '$1');
  var postDatum = $(version.postDate, jNode).text();
	MECtbl.find('tbody').append('<tr><td id="MECjobID' + postID + '"></td><td>' + title + '</td><td><a href="' + postHREF + '">' + postID + '</a></td><td>' + postDatum +'</td></tr>');
  var xmlhttp = new XMLHttpRequest(); 
  xmlhttp.onreadystatechange = function(){
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200){
      var dom = $(xmlhttp.responseText);
      var jobID = dom.find(version.postingAd).attr('href').replace(/.*career_job_req_id=(\d+).*/, "$1");
      $('#MECjobID' + postID).html('<a href="https://career012.successfactors.eu/sfcareer/jobreqcareer?company=KSSG&jobId=' + jobID + '">' + jobID + '</a>');
    }
  }
  xmlhttp.open("GET", postHREF, false);
  xmlhttp.send();
} 
