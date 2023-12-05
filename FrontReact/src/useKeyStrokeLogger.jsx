// taskonset: the time when the question is loaded.
// event time in keystroke logs: keep them as the time point from Unix time.

import { useEffect } from "react";

import { ActivityDetector } from "./ActivityDetector";

export function useKeyStrokeLogger({
  textAreaRef,
  submitButtonRef,
  userId,
  sessionId,
  quizId,
  endpoint = "https://XXXX",
  // Other parameters for the key stroke logger...
}) {
  useEffect(() => {
    const c_textAreaRef = textAreaRef.current;
    const c_submitButtonRef = submitButtonRef.current;

    let taskonset = 0; // set the value as the time when the target question is loaded.
    let EventID = 0;
    let startSelect = [];
    let endSelect = [];
    let ActivityCancel = []; // to keep track of changes caused by control + z
    let TextChangeCancel = []; // to keep track of changes caused by control + z
    let sessionQuiz = sessionId + "-" + quizId;
    let keylog = {
      //Proprieties
      TaskOnSet: [], ///
      TaskEnd: [],
      PartitionKey: [],
      RowKey: [],
      EventID: [], ////
      EventTime: [], ////
      Output: [], ////
      CursorPosition: [], ////
      TextContent: [], ////
      TextChange: [], ////
      Activity: [], /////
      FinalProduct: [], /////
    };

    const handleCursor = (keylog, startSelect, endSelect) => {
      // log cursor position information
      keylog.CursorPosition.push(c_textAreaRef.selectionEnd);
      startSelect.push(c_textAreaRef.selectionStart);
      endSelect.push(c_textAreaRef.selectionEnd);
    };

    const logCurrentText = (e) => {
      keylog.TextContent.push(e.target.value);
    };

    const handleKeyDown = (e) => {
      let d_press = new Date();
      keylog.EventTime.push(d_press.getTime() - taskonset); // start time

      EventID = EventID + 1;
      keylog.EventID.push(EventID);

      // Add a unique RowKey
      keylog.RowKey.push(sessionQuiz + "-" + String(EventID));

      /// when logging space, it is better to use the letter space for the output column
      if (e.key === " ") {
        keylog.Output.push("Space");
      } else if (e.key === "unidentified") {
        keylog.Output.push("ScreenTouch");
      } else {
        keylog.Output.push(e.key);
      }

      logCurrentText(e);
      handleCursor(keylog, startSelect, endSelect);

      // use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );
      // console.log(textNow);
    };

    const handleMouseClick = (e) => {
      let mouseDown_m = new Date();
      let MouseDownTime = mouseDown_m.getTime() - taskonset;

      EventID = EventID + 1;
      keylog.EventID.push(EventID);

      // Add a unique RowKey
      keylog.RowKey.push(sessionQuiz + "-" + String(EventID));

      //////Start logging for this current click down event
      keylog.EventTime.push(MouseDownTime); // starttime
      if (e.button === 0) {
        keylog.Output.push("Leftclick");
      } else if (e.button === 1) {
        keylog.Output.push("Middleclick");
      } else if (e.button === 2) {
        keylog.Output.push("Rightclick");
      } else {
        keylog.Output.push("Unknownclick");
      }

      logCurrentText(e);
      // log cursor position
      handleCursor(keylog, startSelect, endSelect);
      /////// use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );
    };

    const handleTouch = (e) => {
      let d_press = new Date();
      keylog.EventTime.push(d_press.getTime() - taskonset); // start time

      EventID = EventID + 1;
      keylog.EventID.push(EventID);

      // Add a unique RowKey
      keylog.RowKey.push(sessionQuiz + "-" + String(EventID));

      if (e.key === " ") {
        keylog.Output.push("Space");
      } else if (e.key === "Unidentified") {
        keylog.Output.push("UnknownTouch");
      } else {
        keylog.Output.push(e.key);
      }

      keylog.TextContent.push(String(c_textAreaRef.value));
      // log cursor position
      handleCursor(keylog, startSelect, endSelect);

      /////// use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        keylog,
        startSelect,
        endSelect,
        ActivityCancel,
        TextChangeCancel
      );
    };

    const handleSubmit = (e) => {
      e.preventDefault(); // to prevent a browser refresh or reload
      if (EventID === 0) {
        keylog = {
          PartitionKey: [0],
          RowKey: [0],
          TaskOnSet: [0],
          TaskEnd: [0],
          EventID: [0],
          EventTime: [0],
          Output: ["NA"],
          CursorPosition: [0],
          TextContent: [0],
          TextChange: ["NoChange"],
          Activity: ["Nonproduction"],
          FinalProduct: ["The author wrote nothing."],
        };
        //post the data to the serve
      } else {
        keylog.TaskOnSet.push(taskonset); //record task onset time

        ///// adjust the keylog data
        // record current text
        keylog.TextContent.push(String(c_textAreaRef.value));
        // record the final product
        keylog.FinalProduct = String(keylog.TextContent.slice(-1));

        // log cursor position
        handleCursor(keylog, startSelect, endSelect);
        /////// use a customized function to detect and record different activities and the according text changes these activities bring about
        ActivityDetector(
          keylog,
          startSelect,
          endSelect,
          ActivityCancel,
          TextChangeCancel
        );

        //Add PartitionKey
        keylog.PartitionKey.push(userId);

        //Textchange and Activity adjustment
        keylog.TextChange.shift();
        keylog.Activity.shift();

        // cursor information adjustment
        keylog.CursorPosition.shift();

        let d_end = new Date();
        let taskend = d_end.getTime();
        keylog.TaskEnd.push(taskend); //record task end time

        //post the data to the serve and lead to the next page
        let keylog_eedi = {
          PartitionKey: keylog.PartitionKey.toString(),
          RowKey: keylog.RowKey.join(),
          EventID: keylog.EventID.join(),
          EventTime: keylog.EventTime.join(),
          Output: keylog.Output.join("<=@=>"),
          CursorPosition: keylog.CursorPosition.join(),
          TextChange: keylog.TextChange.join("<=@=>"),
          Activity: keylog.Activity.join("<=@=>"),
        };

        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(keylog_eedi),
        };
        fetch(endpoint, options) // Replace the local host with the end point.
          .then((response) => response.json())
          .then((data) => {
            // Handle the response data
            console.log(data);
            console.log(keylog_eedi);
          })
          .catch((error) => {
            // Handle errors
            console.error("Error:", error);
          });

        //empty keylog
        keylog.PartitionKey = [];
        keylog.RowKey = [];
        keylog.EventID = [];
        keylog.EventTime = [];
        keylog.FinalProduct = [];
        keylog.CursorPosition = [];
        keylog.Output = [];
        keylog.TaskEnd = [];
        keylog.TaskOnSet = [];
        keylog.TextChange = [];
        keylog.Activity = [];
        keylog.TextContent = [];
        EventID = 0;
      }

      // reset variables
      EventID = 0;
      startSelect = [];
      endSelect = [];
      ActivityCancel = []; // to keep track of changes caused by control + z
      TextChangeCancel = []; // to keep track of changes caused by control + z

      console.log(
        `Inner submit! e.g. submit the keystroke logging data... (your code) for ${sessionId}`
      );
    };

    const isInput = c_textAreaRef && c_textAreaRef.tagName === "TEXTAREA";
    const isButton =
      c_submitButtonRef && c_submitButtonRef.tagName === "BUTTON";
    //const formElement = currentRef?.closest("form");

    if (isInput) {
      c_textAreaRef.addEventListener("keydown", function (e) {
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          handleSubmit(e);
        } else {
          handleKeyDown(e);
        }
      });
      c_textAreaRef.addEventListener("mousedown", handleMouseClick);
      // for touch screen devices, event listener needs to be added to the whole document.
      window.addEventListener("touchstart", function (e) {
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          handleSubmit(e);
        } else {
          handleTouch(e);
        }
      });
    }

    if (isButton) {
      c_submitButtonRef.addEventListener("click", handleSubmit);
    }

    // Remove the current event listeners. They do not automatically disappear with new rerenderings.

    return () => {
      if (isInput) {
        c_textAreaRef.removeEventListener("keydown", function (e) {
          if (
            e.key === "Enter" &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey
          ) {
            handleSubmit(e);
          } else {
            handleKeyDown(e);
          }
        });
        c_textAreaRef.removeEventListener("mousedown", handleMouseClick);
        // for touch screen devices, event listener needs to be added to the whole document.
        document.removeEventListener("touchstart", function (e) {
          if (
            e.key === "Enter" &&
            !e.ctrlKey &&
            !e.shiftKey &&
            !e.altKey &&
            !e.metaKey
          ) {
            handleSubmit(e);
          } else {
            handleTouch(e);
          }
        });
      }

      if (isButton) {
        c_submitButtonRef.removeEventListener("click", handleSubmit);
      }
    };
  }, [textAreaRef, submitButtonRef, userId, sessionId, quizId, endpoint]);

  //return { handleSubmit };
}
