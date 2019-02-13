$(document).ready(function() {
  //variable to track which autocomplete option user is choosing
  var focus = 0;

  //AUTOCOMPLETE FUNCTIONALITY
  $("#input").keyup(function(e) {
    //if input is empty and key "up" and "down" and "enter" were not pressed, proceed to request query from wiki by ajax
    if (
      $(this).val() != "" &&
      e.which != 38 &&
      e.which != 40 &&
      e.which != 13
    ) {
      //gets query from wikipedia containing suggestions
      //$("#results").empty();
      $.ajax({
        url: "https://en.wikipedia.org/w/api.php",
        dataType: "jsonp",
        data: {
          action: "opensearch",
          format: "json",
          search: $("#input").val()
        },
        success: function(data) {
          //iterates through list
          $.each(data[1], function(i, v) {
            //Inserts in the dropdown the data of the wiki query
            $(".dropdown-el:eq(" + i + ")").text(data[1][i]);
            $(".dropdown-el:eq(" + i + ")").on("click", function() {});
          }); //end of for loop
          $(".dropdown-content").addClass("show"); //shows autocomplete
        } //end of success handler function
      }); //end of Ajax
    } //end of IF

    //If dropdown content is shown which means query has already been made
    else if ($(this).val() != "" && $(".dropdown-content").hasClass("show")) {
      //if 'down' key is pressed
      if (e.which == 40) {
        $(".dropdown-el:eq(" + (focus % 10) + ")").addClass("changeBackground");
        $(this).val($(".dropdown-el:eq(" + (focus % 10) + ")").text());
        if (focus != 0) {
          $(".dropdown-el:eq(" + ((focus % 10) - 1) + ")").removeClass(
            "changeBackground"
          );
          $(this).val($(".dropdown-el:eq(" + (focus % 10) + ")").text());
        }
        focus++;
        console.log("focus is ", focus % 10);
      } //end of if for down key

      //If "up" key is pressed
      else if (e.which == 38) {
        $(".dropdown-el:eq(" + ((focus % 10) - 1) + ")").removeClass(
          "changeBackground"
        );
        $(".dropdown-el:eq(" + ((focus % 10) - 2) + ")").addClass(
          "changeBackground"
        );
        $(this).val($(".dropdown-el:eq(" + ((focus % 10) - 2) + ")").text());
        if (focus == 0) {
          focus = 10;
          $(".dropdown-el:eq(" + ((focus % 10) - 1) + ")").removeClass(
            "changeBackground"
          );
          $(".dropdown-el:eq(" + ((focus % 10) - 2) + ")").addClass(
            "changeBackground"
          );
          $(this).val($(".dropdown-el:eq(" + ((focus % 10) - 2) + ")").text());
        }
        focus--;
      }
    }

    //if input contains nothing, hides dropdown
    else if ($(this).val() == "") {
      $(".dropdown-content").removeClass("show");
      $(".dropdown-el:eq(" + ((focus % 10) - 1) + ")").removeClass(
        "changeBackground"
      );
      focus = 0;
    }
  }); //END AUTOCOMPLETE FUNCTIONALITY

  //AJAX QUERY FOR ARTICLES

  //when User submits search call get_query function
  $("#form").submit(function(e) {
    //prevents standart behaviour of document when submiting a form
    e.preventDefault();
    $("div", $(".dropdown-content")).each(function() {
      $(this).removeClass(".changeBackground");
    });
    var value = $("#input").val();
    //hides dropdown content
    $(".dropdown-content").removeClass("show");
    get_query(value);
  });

  var results = [];
  //makes Ajax request for the wikipedia data regarding the user input
  function get_query(value) {
    var wikiAPI =
      "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=";
    $("#results").empty();
    //Ajax to retrieve data from wiki
    $.ajax({
      url: wikiAPI + value,
      dataType: "jsonp",
      //if ajax successfull inserts results on the result array , and calls the draw function
      success: function(data) {
        //If ajax was successfull and there was no error from the server(meaning query is in json file)
        if ("query" in data) {
          //resets list in case there was a previous iteration
          results = [];
          var pages = data.query.pages;
          //inserts key value pair into the empty list "results" previosly initiated
          for (n in pages) {
            var obj = {
              pageId: pages[n].pageid,
              title: pages[n].title,
              extract: pages[n].extract
            };
            results.push(obj);
          } //end of loop
          console.log(results);
          draw(results); //call draw function
        }
        //if query turns with no results
        else {
          $("p").html("I couldnt find");
        }
      }, //end of success parameter
      //error handling function in case ajax fails
      error: function() {
        $("p").html("Could not retrieve your query try again later :) ");
      }
    }); //End of AJAX
  } //End of getQuery function

  //END OF AJAX QUERY FOR ARTICLES

  //DRAW FUNCTIONS FOR BOXES CONTAINING TITLE AND DESCRIPTION OF WIKI ARTICLES

  //iterates through the results array containing wiki data and calls doDelay function to draw with delay the multiple boxes
  function draw(results) {
    for (n in results) {
      draw_delay(n);
    } //end of loop
  }

  //draws the boxes with delay
  function draw_delay(n) {
    setTimeout(function() {
      $("#results").append(
        '<a href="https://en.wikipedia.org/?curid=' +
          results[n].pageId +
          '"class="box animated fadeInUp"  target="_blank" ><h1>' +
          results[n].title +
          "</h1><p>" +
          results[n].extract +
          "</p></a>"
      );
    }, n * 200);
  } //end of draw_delay function

  //END DRAW FUNCTIONS

  //ON CLICK EVENTS//////////

  //When user clicks reduced input button
  $("#input").click(function(e) {
    //if input is ready for user and if user clicks the random icon , links to random wiki page
    if ($(this).hasClass("animateInput")) {
      var pWidth = $(this).innerWidth();
      var pOffset = $(this).offset();
      var x = e.pageX - pOffset.left;
      if (pWidth - x < 60) {
        window.open("https://en.wikipedia.org/wiki/Special:Random", "_blank");
      }
    } //end of if
    //if input is closed , animates it
    else {
      //delays placeholder so it looks cleaner
      setTimeout(function() {
        $("#input").attr("placeholder", "What ye lookin for?");
      }, 150);
      $(this).addClass("animateInput");
      $(".dropdown").animate({ top: "20%" });
    }
  });

  //when user click outside input or autocomplete list
  $(document).click(function(e) {
    if (!(e.target == input || $(e.target).attr("class") == "dropdown-el")) {
      var i = $("#input");
      $(".dropdown").animate({ top: "40%" });
      i.removeClass("animateInput");
      i.attr("placeholder", "");
      i.val("");
      $(".dropdown-content").removeClass("show");
    }
    $("#results").empty();
  });

  //On click for an element on the autocomplete list
  $(".dropdown-el").on("click", function(e) {
    var value = $("#input").val();
    $(".dropdown-content").removeClass("show");
    get_query(value);
  });

  //END OF ON CLICK EVENTS//////////
});
