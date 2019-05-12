// firebase config object
  var config = {
    apiKey: "AIzaSyAiR3aioU-7QxK99-4_OWtFv7LKXEbTQ_Q",
    authDomain: "train-scheduler-d8edc.firebaseapp.com",
    databaseURL: "https://train-scheduler-d8edc.firebaseio.com",
    projectId: "train-scheduler-d8edc",
    storageBucket: "train-scheduler-d8edc.appspot.com",
    messagingSenderId: "826381762982"

  };
  
  var updateCurrentTrainSchedule = function() {
    now = moment();
    $(`#current-time-display`).text(`Current Time: ${now.format(`hh:mm`)}`);
    $(`#current-train-schedule`).empty();
    trainsRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        appendToTrainSchedule(doc.data());
      });
    });
  };
  
  var appendToTrainSchedule = function(train) {
    let myTrain = $(`<tr>`);
    myTrain.append($(`<td>`).text(train.name));
    myTrain.append($(`<td>`).text(train.destination));
    myTrain.append($(`<td>`).text(train.frequency));
    let nextArrival = calculateNextArrival(
      train.firstTrainHours,
      train.firstTrainMinutes,
      train.frequency
    );
    myTrain.append($(`<td>`).text(nextArrival.format(`hh:mm A`)));
    myTrain.append($(`<td>`).text(nextArrival.diff(now, "minutes")));
    $(`#current-train-schedule`).append(myTrain);
  };
  
  var calculateNextArrival = function(hours, minutes, frequency) {
    let myMoment = moment();
  
    myMoment.hour(parseInt(hours));
    myMoment.minute(parseInt(minutes));
    frequency = parseInt(frequency);
  
    while (myMoment.diff(now, `minutes`) < 0) {
      myMoment.add(frequency, `minutes`);
    }
  
    return myMoment;
  };
  
  var addTrainToDb = function(train) {
    trainsRef
      .add(train)
      .then(function() {
        $(`#add-train-message`).append($(`<h6>`).text(`Train Added to Database`));
      })
      .catch(function(error) {
        $(`#add-train-message`).append(
          $(`<h6 class="text-danger">`).text(`Train failed to add to Database`)
        );
      });
  };
  
  var onAddTrainBtn = function() {
    
      $(`#add-train-message`).empty();
      let myTrain = validateTrainForm();
      if (myTrain.valid) {
        $(`#add-train-message`).append($(`<h6>`).text(`Train Inputs are Valid`));
        // add the train to the database
        addTrainToDb(myTrain);
    
        $(`#train-name-input`).val(``);
        $(`#destination-input`).val(``);
        $(`#first-train-hours`).val(``);
        $(`#first-train-minutes`).val(``);
        $(`#frequency-input`).val(``);
      } else {
        $(`#add-train-message`).append(
          $(`<h6 class="text-danger">`).text(`One or more inputs are not valid`)
        );
      }
  
  };
  
  var validateTrainForm = function() {
    let name = $(`#train-name-input`)
      .val()
      .trim();
    let destination = $(`#destination-input`)
      .val()
      .trim();
    let firstTrainHours = $(`#first-train-hours`)
      .val()
      .trim();
    let firstTrainMinutes = $(`#first-train-minutes`)
      .val()
      .trim();
    let frequency = $(`#frequency-input`)
      .val()
      .trim();
  
    let myObject = {
      name: ``,
      destination: ``,
      firstTrainHours: ``,
      firstTrainMinutes: ``,
      frequency: ``,
      valid: false
    };
  
    if (
      validateName(name) &&
      validateDestination(destination) &&
      validateHours(firstTrainHours) &&
      validateMinutes(firstTrainMinutes) &&
      validateFrequency(frequency)
    ) {
      myObject.name = name;
      myObject.destination = destination;
      myObject.firstTrainHours = firstTrainHours;
      myObject.firstTrainMinutes = firstTrainMinutes;
      myObject.frequency = frequency;
      myObject.valid = true;
    }
  
    return myObject;
  };
  
  var validateName = function(name) {
    if (typeof name === "string" && name.length > 0) {
      return true;
    } else {
      return false;
    }
  };
  
  var validateDestination = function(destination) {
    if (typeof destination === "string" && destination.length > 0) {
      return true;
    } else {
      return false;
    }
  };
  
  var validateHours = function(hours) {
    if (
      isNaN(hours) ||
      hours.length === 0 ||
      parseInt(hours) < 0 ||
      parseInt(hours) > 23
    ) {
      return false;
    } else {
      return true;
    }
  };
  
  var validateMinutes = function(minutes) {
    if (
      isNaN(minutes) ||
      minutes.length === 0 ||
      parseInt(minutes) < 0 ||
      parseInt(minutes) > 59
    ) {
      return false;
    } else {
      return true;
    }
  };
  
  var validateFrequency = function(frequency) {
    if (isNaN(frequency) || frequency.length === 0 || parseInt(frequency) < 0) {
      return false;
    } else {
      return true;
    }
  };
  

  firebase.initializeApp(config);
  var db = firebase.firestore();
  var trainsRef = db.collection(`trains`);
  var now;
  
  // create shortcuts to DOM element
  var addTrainsLinkElement = $("#add-trains-link");
  var currentTimeElement = $("#current-time-display");
  var currentTrainsElement = $("#current-train-schedule");
  var addTrainsElement = $("#add-trains");
  var trainNameInput = $("#train-name-input");
  var destinationInput = $("#destination-input");
  var firstTrainHoursInput = $("#first-train-hours");
  var firstTrainMinutesInput = $("#first-train-minutes");
  var frequencyInput = $("#frequency-input");
  var addTrainBtn = $("#add-train-btn");
  

  $(addTrainBtn).click(onAddTrainBtn);
  $(addTrainsElement);
  $(addTrainsLinkElement);
  trainsRef.onSnapshot(updateCurrentTrainSchedule);
  
  setInterval(updateCurrentTrainSchedule, 60000);