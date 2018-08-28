/*=======================================
     global variables
=======================================*/
var noOfUsers = 50; // assign the number of users taking the user study
var prefix = "U_"; // prefix for each user_id
var noOfImages = 5//445;

// var noOfTrainingImages = 20;
// var noOfSegmentTestingImages = 4; // no of segments for testing images

var allUserIDs = []; // to autopopulate and store all user-ids
var USERID = ""; // contains selected user_id at all times
var entireUserData; // contains entire MetaData.csv for each user
var newOutputData=[];
var ClickCount = 1; // keep track of no of clicks - to be used to compare against folderID
var boolTime = true; // toggle between event start and stop
var startTime, endTime, timeTaken;
var notPause = true;
var eventType;
/*=======================================
  All function calls (invoked OnLoad)
=======================================*/
    // scroll to top of page on load
    $(document).scrollTop(0)

    $('#main-div').hide();
    $('#pause-div').hide();
    $('#start-test-div').hide();
    $('#thank-you-div').hide();

    populateSelectDropdown();


/*=======================================
                get UserID
=======================================*/
  function populateSelectDropdown(){
    $.fn.select2.defaults.set( "theme", "bootstrap4" ); // ensure select2(for dropdown) is using Bootstrap4

    // generate all_user_id options for dropdown
    for(i=1; i<=noOfUsers; i++){
      var idName = prefix + i;
      allUserIDs.push(idName);
      idName = ""
    }
    // populate select2 dropdown with all_user_ids
    $("#UserId").select2();
    $("#UserId").select2({
    data: allUserIDs });
    $('#UserId').select2({
      placeholder:'Select a User ID'
    })
    // on selection/data-value change invoke other functions
    $('#UserId').on('change', function() {
      USERID = $("#UserId option:selected").text();
      // FN CALLS
      toggleOptions()
      showStartTestDiv()
    })
  }

    function toggleOptions(){
      // add the USERID and other options to the webpage
      var html = "<span class='nav-item nav-link' id='selectedUserID'>UserID: " +USERID+"</span><a class='nav-item nav-link'  onclick='showPauseDiv()'>Pause</a><a class='nav-item nav-link' href='/downloadcsv'>Download CSV</a>"
      document.getElementById('otherOptions').innerHTML+= html;
    }

/*=======================================
        Toggle Divs
=======================================*/

    function showStartTestDiv(){
      $('#user-div').hide();
      $('#main-div').hide();
      $('#pause-div').hide();

      $('#start-test-div').show();
      var startTest = document.getElementById('start-test-btn');
      startTest.onclick = function(){ showMainDiv(); }
      // TODO: start timer
      // FN CALLS
    }

    function showMainDiv(){
      $('#user-div').hide();
      $('#start-test-div').hide();
      $('#pause-div').hide();

      $('#main-div').show();
      // FN CALLS
      notPause = true;
      startRecordTime();
      readCSVfile()
    }

    function showPauseDiv(){
      console.log("----ON PAUSE----");
      $('#user-div').hide();
      $('#start-test-div').hide();
      $('#main-div').hide();

      $('#pause-div').show();
      // TODO:  pause timer
      notPause = false;
      // FN CALLS
    }

    function showThankYouDiv() {
      $('#main-div').hide();

      console.log("THE END!");
      $('#thank-you-div').show();
    }

/*=======================================
        Read CSV & Display IMAGES
=======================================*/
// Read csvfile
function readCSVfile(){
  $.ajax({
      type: "GET",
      url: "./static/input/"+USERID+"/MetaData.csv",
      dataType: "text",
      success: function(data) { getCSVData(data);}
   });
  function getCSVData(allData) {
      var finalCSVData = [];
      var cleanAllData = allData.split("\n");
      var csvHeader = cleanAllData[0].split(',');
      for (var i=1; i<cleanAllData.length; i++) {
          var eachRecord = cleanAllData[i].split(',');
              var tempObj = {};
              for (var j=0; j<csvHeader.length; j++) {
                  tempObj[csvHeader[j]] = eachRecord[j];
              }
              finalCSVData.push(tempObj);
      }
      entireUserData = finalCSVData;
      // FN CALL
      handleEvents(entireUserData)
    }
}

  // Handle Events to dynamicLoadImages
  function handleEvents(entireJson){
    //  load first set of images
    console.log(ClickCount);
    if(ClickCount==1){
      // FN CALL to directly changeImage - for loading the L & R image in folder1 of selected User ID
      changeImage(entireJson, ClickCount)
      startRecordTime();
    }
    //  action for click on buttons
    var image1 = document.getElementById('image1Btn');
    var similar = document.getElementById('similarBtn');
    var image2 = document.getElementById('image2Btn');
    image1.onclick = function(){
      // getTimeInBetweenEvents()
      ClickCount++;
      eventType = "LEFT";
      dynamicLoadImage(entireJson)
      getTimeInBetweenEvents()
    }
    similar.onclick = function(){
      // getTimeInBetweenEvents()
      ClickCount++;
      eventType = "BOTH";
      dynamicLoadImage(entireJson)
      getTimeInBetweenEvents()
    }
    image2.onclick = function(){
      // getTimeInBetweenEvents()
      ClickCount++;
      eventType = "RIGHT";
      dynamicLoadImage(entireJson)
      getTimeInBetweenEvents()
    }

    // OR Check for other KEY Events
    checkKeyEvents(entireJson)
  }

    // Check for KeyPress Events
    function checkKeyEvents(entireJson){
      document.onkeydown = checkKey;
      function checkKey(e){
        e = e || window.event;
        if(e.keyCode =='37'){
          // getTimeInBetweenEvents()
          console.log("LEFT ARROW");
          ClickCount++
          eventType = "LEFT";
          dynamicLoadImage(entireJson)
          getTimeInBetweenEvents()
        }
        else if(e.keyCode == '39'){
          // getTimeInBetweenEvents()
          console.log("RIGHT ARROW");
          ClickCount++;
          eventType = "RIGHT";
          dynamicLoadImage(entireJson)
          getTimeInBetweenEvents()
        }
        else if(e.keyCode == '32'){
          // getTimeInBetweenEvents()
          console.log("SPACE");
          eventType = "BOTH";
          ClickCount++
          dynamicLoadImage(entireJson)
          getTimeInBetweenEvents()
        }
      }
    }

// Dynamically load Left & Right images
function dynamicLoadImage(ejsonObj) {
  // console.log(ClickCount, ejsonObj[ClickCount-1]);
    if(ClickCount<<noOfImages+1){
      var folderCounter = ejsonObj[ClickCount-1].Fig_IDs;

      if(ClickCount>>1 && folderCounter == ClickCount){
        changeImage(ejsonObj, folderCounter)
      }
    }
}

  // changes image source for L & R images
  function changeImage(jsonObj, folderCount){
    leftImgSrc = "./static/input/"+USERID+"/"+folderCount+"/L/"+jsonObj[folderCount-1].Left_Name+".png";
    var leftImage = document.getElementById('leftImage');
    leftImage.src = leftImgSrc;
    rightImgSrc = "./static/input/"+USERID+"/"+folderCount+"/R/"+jsonObj[folderCount-1].Right_Name+".png";
    var rightImage = document.getElementById('rightImage');
    rightImage.src = rightImgSrc;

    // FN CALL
    updateProgress()
  }


/*=======================================
                PROGRESS BAR
=======================================*/
function updateProgress(){
  var percentProgress = Math.ceil((ClickCount / noOfImages)*100);
  var remaining = noOfImages - ClickCount; //Math.round(((ClickCount / noOfImages)*100)*100)/100;
  document.getElementById("testProgressBar").style.width = percentProgress+"%";
  document.getElementById("testProgressBarLabel").innerHTML = percentProgress+"% Complete.  "+ClickCount+"/"+noOfImages+"  ("+remaining+" remaining)"
}


/*=======================================
                Testing Time
=======================================*/
function getTimeInBetweenEvents(){
    // if(ClickCount < noOfImages+1)
      endRecordTime();
      // console.log(ClickCount);
}

  function startRecordTime() {
    startTime = new Date();
    boolTime = !boolTime;
  };
  function endRecordTime() {
      endTime = new Date();
      timeTaken = endTime - startTime; //in ms
      // strip the ms
      // timeDiff /= 1000;
      // get seconds
      // timeTaken = Math.round(timeDiff);
      var x = ClickCount - 1;
      console.log("Time taken for No:"+ x +" is: "+timeTaken+" in ms");
      boolTime = !boolTime;
      if(notPause){
        startRecordTime();
        writeCSV(x)
      }
      if(ClickCount == noOfImages+1){
        showThankYouDiv()
        console.log(newOutputData);
      }
  }


/*=======================================
                OUTPUT CSV
=======================================*/
function writeCSV(subfolderCount) {
  // push required data in to new json
  currentObj = {};
  currentObj['userID']=USERID;
  currentObj['subfolder']=subfolderCount;
  currentObj['selectedImage']= eventType;
  currentObj['timeStamp']= new Date(); // current time
  currentObj['timeTaken'] = timeTaken; // ime taken until keypress/event
  newOutputData.push(currentObj)

  var downloadCSV = document.getElementById('downloadCSV');

  downloadCSV.onclick = function(){ exportData() }
}

function ConvertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';
  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
          if (line != '') line += ','
          line += array[i][index];
      }
      str += line + '\r\n';
  }
  return str;
}

function exportData() {
    var data = ConvertToCSV(newOutputData);
    var exportLink = document.createElement('a');
    exportLink.setAttribute('href', 'data:text/csv;base64,' + window.btoa(data));
    exportLink.appendChild(document.createTextNode(USERID+'.csv'));
    document.getElementById('downloadCSV').appendChild(exportLink);
}
