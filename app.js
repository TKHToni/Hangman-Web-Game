//Requirements
const express = require('express');
const randomWords = require('random-words');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()


//Calling and using requirements
mongoose.connect(`mongodb+srv://admin-Toni:${process.env.PASSWORD}@cluster0.t303q.mongodb.net/hangDB`);
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());


//Schema and Model creation
const scoreSchema = new mongoose.Schema ({
  name: String,
  email: String,
  score: Number
});

const Score = mongoose.model("Score", scoreSchema);


//Declaring variables
let currentWord;
let currentWordArray;
let discoveredWordsArray;
let usedLetters;
let mistakes;
let lost;
let win;
let lengthMultiplier;
let uniqueMultiplier;
let score;
let alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

//------------------------------Routes------------------------------
app.get("/", function(req, res){
  //In the moment the page is refreshed a new word is generated
  currentWord = randomWords();
  console.log(currentWord);

  //Creates an array with each letter of the word
  currentWordArray = currentWord.split("");

  //Takes the length of the word or array
  arrayLength = currentWordArray.length;

  //Defining Score Multipliers
  if (arrayLength >= 10) {
    lengthMultiplier = 2.5;
  } else if (arrayLength >= 7) {
    lengthMultiplier = 2;
  } else if (arrayLength >= 4) {
    lengthMultiplier = 1.5;
  } else {
    lengthMultiplier = 1;
  }

  const uniqueCount = new Set(currentWordArray).size;
  if (arrayLength >= 4) {
    if (uniqueCount >= 7) {
      uniqueMultiplier = 2.5;
    } else if (uniqueCount >= 5) {
      uniqueMultiplier = 2;
    } else if (uniqueCount >= 3) {
      uniqueMultiplier = 1.5;
    } else {
      uniqueMultiplier = 1;
    }
  } else {
    uniqueMultiplier = 1;
  }

  //Starts an array with values undefined and the same length as the word array
  discoveredWordsArray = Array.apply(null, Array(arrayLength)).map(function () {});

  //Reset the used Letters
  usedLetters=[];

  //Reset the number of mistakes
  mistakes = 0;

  //Reset the lost value
  lost = false;

  //Reset the win value
  win = false;

  //Reset the score value
  score = 0;

  res.render("home", {discoveredWordsArray: discoveredWordsArray, alphabet: alphabet, usedLetters: usedLetters, mistakes: mistakes, lost: lost, win: win, score: score});
});



app.post("/", function(req,res){
  //Assign the key clicked to a variable. Warning! Remember to place the value on the button in the EJS template.
  keyUsed = req.body.key;

  //Add to the used letters array
  usedLetters.push(keyUsed);

  //Check if the letter is in the word
  if (currentWordArray.includes(keyUsed)) {
    //Update Score
    score = score + 100*lengthMultiplier*uniqueMultiplier;

    //Create/clear the indices array
    let indices = [];

    //Index finder
    let idx = currentWordArray.indexOf(keyUsed);

    //Loop to find all the indices of the letter present in the word
    while (idx != -1) {
      indices.push(idx);
      idx = currentWordArray.indexOf(keyUsed, idx + 1);
    }

    //Adding the letters to the discovered array
    for (var i = 0; i < indices.length; i++) {
      discoveredWordsArray[indices[i]] = keyUsed;
    }

    //Check if the word is complete
    if (discoveredWordsArray.indexOf(undefined) !== -1) {
      res.render("home", {discoveredWordsArray: discoveredWordsArray, alphabet: alphabet, usedLetters: usedLetters, mistakes: mistakes, lost: lost, win: win, score: score});
    } else if (discoveredWordsArray.toString() === currentWordArray.toString()) {
      win = true;
      res.render("home", {discoveredWordsArray: discoveredWordsArray, alphabet: alphabet, usedLetters: usedLetters, mistakes: mistakes, lost: lost, win: win, score: score});
    }

  } else {
    //Update Score
    score = score - 100
    if (score < 0) {
      score = 0
    }

    //Increment the mistakes
    mistakes = ++mistakes;

    //Check if the game is lost
    if (mistakes == 10) {
      lost = true;
      discoveredWordsArray = currentWordArray;
      res.render("home", {discoveredWordsArray: discoveredWordsArray, alphabet: alphabet, usedLetters: usedLetters, mistakes: mistakes, lost: lost, win: win, score: score});
    } else {
      res.render("home", {discoveredWordsArray: discoveredWordsArray, alphabet: alphabet, usedLetters: usedLetters, mistakes: mistakes, lost: lost, win: win, score: score});
    }

  }

});

app.post("/scoreSubmit", function(req, res) {
  let playerName = req.body.playerName;
  let playerEmail = req.body.playerEmail;
  let playerScore = score;
  console.log(req.body.playerName, req.body.playerEmail, score);

  //Search for a record with the same email
  Score.find({email: playerEmail}, function(err, foundEntries){
    if (err) {
      console.log(err);
    } else {
      //If there is no entry, create a new one
      if (foundEntries[0] == null) {

        const scoreEntry = new Score({
          name: playerName,
          email: playerEmail,
          score: score
        });
        scoreEntry.save();

        console.log("saved new entry");

      //If there is a record check if the score achieved now is higher. If yes update
      } else {
        console.log("about to update entry");
        if (foundEntries[0].score < score) {
          Score.updateOne({email: playerEmail}, {name: playerName, score: score}, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("updated entry");
            }
          });
        }
      }
    }
  });


  res.redirect("/scoreboard");
});

app.get("/scoreboard", function(req,res) {
  Score.find(function(err, foundEntries){
    if (err) {
      console.log(err);
    } else {
      console.log(foundEntries);
      //Sorting by score
      foundEntries.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));

      console.log(foundEntries);
      res.render("scoreboard", {scores: foundEntries});
    }
  });


})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
