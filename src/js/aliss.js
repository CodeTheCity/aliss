// start query
$(document).ready(function(){

  //links
  //http://eloquentjavascript.net/09_regexp.html
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  nlp = window.nlp_compromise;

  var messages = [], //array that hold the record of each string in chat
    lastUserMessage = "", //keeps track of the most recent input string from the user
    botMessage = "", //var keeps track of what the chatbot is going to say
    botName = 'ALISS bot', //name of the chatbot
    talking = true; //when false the speach function doesn't work
  var liveALISSresults = {};
  var liveMedical = '';

  //edit this function to change what the chatbot says
  //workflow logic
  var botquestions = ["Do you need immediate support?", "Are you under 18?", "What do you want to talk about?", "where"];

  var decisionlogic = ["decision, if yes, ask 01 else if no, ask 03", "ask the next question",];

  var botanswer = [["21", "Give the caring people at http://www.ChildLine.org a call."], ["20", "Talk to someone, how about The http://www.Samaritans.org"], ["31", "Sure, I can help with that. Tell me your location and I can suggest places of support."], ["4", 'Click on the map link <div id="mapurl"></div>']];

  var apisources = {};
  apisources.aliss = "https://www.aliss.org/api/v2/search/?q=";
  apisources.medical = "https://www.aliss.org/api/v2/search/?q=";
  apisources.location = "https://maps.googleapis.com/maps/api/js?";

  var messageCount = 0;

  // the default html placer has a displayed a starting messageCount
  // at this stage, the user can input any text, lets give them a second and prompt a new questions
  chatbotResponse();

  // original template functions
  function greeting()
  {
    botMessage = "greeting"; //initial text shown in chat
  }

  function chatbotResponse() {

    // TODO
    // need to parce free text box inpu lastUserMessage  extract what want to talk about and location (could do postcode, city, or on mobile ask to share gps location etc. )  Then need to setup decision tree logic below.
    //parseReply();  // this will need some sort of call back before commence with logic below

    talking = true;
    botMessage = "Sorry, I am unable to help."; //the default message
    messageCount++;

    var placer = '<div id="chatlog' + messageCount + '" class="chatlog"></div>';
    // create a div for this message to be place in
    $("#chat-conversation").append(placer);

    // append text / ui interation code to placeholder
    var placerContent = "#chatlog" + messageCount;
    $(placerContent).append(lastUserMessage);
    messageCount++;

    var placerBot = '<div id="chatlogbot' + messageCount + '" class="chatlog"></div>';
    $("#chat-conversation").append(placerBot);

      botMessage = 'Do you need immediate help and support?';
console.log(messageCount);
    if (lastUserMessage === 'yes' && messageCount == 4) {

      botMessage = botquestions[1];
    }

    else if (lastUserMessage === 'no' && messageCount == 4) {

      botMessage = botquestions[2];
    }

    else if (lastUserMessage === 'yes' && messageCount > 4) {

      botMessage = botanswer[0][1];

    }

    else if (lastUserMessage === 'no' && messageCount > 4) {
      botMessage = botanswer[1][1];
    }

    else if (lastUserMessage.lenght > 1 && messageCount > 3) {
      botMessage = botanswer[0][20];;
    }

    else if (lastUserMessage === 'anxiety' && messageCount > 4) {
      botMessage = botanswer[2][1];
      liveMedical = lastUserMessage;
      // call the api for resources for this term
      parseReply("medical", "anxiety");
    }

    else if (lastUserMessage == 'Aberdeen' && messageCount > 6) {;
      botMessage = botanswer[3][1];
      parseReply("location", "Aberdeen");

    }

    //add the chatbot's name and message to the array messages
    messages.push("<b>" + botName + ":</b> " + botMessage);
    // says the message using the text to speech function written below
    Speech(botMessage);

    // add the bots next prompt messageCount
    var placerBot = "#chatlogbot" + messageCount;
    //$(placerBot).html("<b>" + botName + ":</b> " + botMessage);
    var chatMessageFormatting = '<p>' ;
      chatMessageFormatting
      += '<img src="/src/images/aliss_avatar2.png"/>';
     // chatMessageFormatting +=  "*";
      chatMessageFormatting +=  "</p>";
      
      $(placerBot).html(chatMessageFormatting + "<b>" + botName + ":</b> " + botMessage);

  };

  function ageCheck()
  {

    if (lastUserMessage > 18)
    {
      botMessage = '1. Here is the Samaritans number, 116 123 ';
    }
    else {
      botMessage = '2. Here is the ChildLine number, 0800 1111 ';
    }
    //else//
  };

  function parseReply(contextSuggest, contextIN)
  {
    // e.g seem like medical condition or location info?
    var apiURL = '';
    // make decision tree to decide which data source is most appropriate?
    if(contextSuggest == "medical")
    {
      apiURL = apisources.medical + contextIN;
      // given context make appropriate API call to source data
      makeAPIcall(apiURL, contextIN);
    }
    else if(contextSuggest == "location")
    {
      // match from list of ALISS api data results
      apiURL = apisources.aliss + liveMedical +'&location=' + contextIN;
      // given context make appropriate API call to source data
      makeAPIcallcontextlocation(apiURL, contextIN);
    }


  };

  function makeAPIcall(URLin, contextIN)
  {
    var apiDatareturned = '';

    $.get( URLin, function( data ) {

        liveALISSresults = data;
        // extract the information and make available to UI
        //dataExtractionCondition(liveALISSresults);

    });

  };

  function makeAPIcallcontextlocation(URLin, contextIN)
  {
    var apiDatareturned = '';
    $.get( URLin, function( data ) {
        liveALISSresults = data;
        // extract the information and make available to UI
        dataExtractionCondition(liveALISSresults);

    });

  };

  function dataExtractionCondition(dataIN)
  {
      matchLocation(dataIN.results[1].locations[0].lat, dataIN.results[1].locations[0].lon)
//    dataIN.results.forEach(function(extractElements) {
//console.log(extractElements);
      // need logic to extract top results cor ordincates

  //  });

  };

  // format google map URL
  function matchLocation(latIN, longIN)
  {

    var mapurlUIlink = '<a href="' + apisources.location + 'lat=' + latIN + '&lon=' + longIN + '">Aberdeen</a>';

    // attach to UI as a reply  temp hack
    $("#mapurl").html("<b>" + mapurlUIlink + ":</b> ");

  };

  //****************************************************************
  //
  //this runs each time enter is pressed.
  //It controls the overall input and output
  function newEntry() {
    //if the message from the user isn't empty then run
    if (document.getElementById("chatbox").value != "")
    {
      //pulls the value from the chatbox ands sets it to lastUserMessage
      lastUserMessage = document.getElementById("chatbox").value;
      //sets the chat box to be clear
      document.getElementById("chatbox").value = "";
      //adds the value of the chatbox to the array messages
      messages.push(lastUserMessage);
      //Speech(lastUserMessage);  //says what the user typed outloud
      //sets the variable botMessage in response to lastUserMessage
      chatbotResponse();

    }
  };

  //text to Speech
  //https://developers.google.com/web/updates/2014/01/Web-apps-that-talk-Introduction-to-the-Speech-Synthesis-API
  function Speech(say) {
    if ('speechSynthesis' in window && talking) {
      var utterance = new SpeechSynthesisUtterance(say);
      //msg.voice = voices[10]; // Note: some voices don't support altering params
      //msg.voiceURI = 'native';
      //utterance.volume = 1; // 0 to 1
      //utterance.rate = 0.1; // 0.1 to 10
      //utterance.pitch = 1; //0 to 2
      //utterance.text = 'Hello World';
      //utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  }

  //runs the keypress() function when a key is pressed
  document.onkeypress = keyPress;
  //if the key pressed is 'enter' runs the function newEntry()
  function keyPress(e) {
    var x = e || window.event;
    var key = (x.keyCode || x.which);

    // time pattern input of each chartact could be collected and added to context gathering

    if (key == 13 || key == 3) {
      //runs this function when enter is pressed
      newEntry();
    }
    if (key == 38) {
      console.log('hi')
        //document.getElementById("chatbox").value = lastUserMessage;
    }
  }

  //clears the placeholder text ion the chatbox
  //this function is set to run when the users brings focus to the chatbox, by clicking on it
  function placeHolder() {
    document.getElementById("chatbox").placeholder = "";
  }

});
