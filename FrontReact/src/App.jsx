// taskonset: the time when the question is loaded.
// event time in keystroke logs: keep them as the time point from Unix time.
import { createRef, Component } from "react";

import { ActivityDetector } from "./ActivityDetector";

class KeyStrokeLogger extends Component {
  // set class properties
  userId = 0;
  sessionId = "XXX";
  quizId = "YYY";
  endpoint = "https://XXXX";

  taskonset = 0; // set the value as the time when the target question is loaded.
  EventID = 0;
  startSelect = [];
  endSelect = [];
  ActivityCancel = []; // to keep track of changes caused by control + z
  TextChangeCancel = []; // to keep track of changes caused by control + z
  sessionQuiz = this.sessionId + "-" + this.quizId;
  keylog = {
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

  constructor(props) {
    super(props);
    this.handleCursor = this.handleCursor.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseClick = this.handleMouseClick.bind(this);
    this.handleTouch = this.handleTouch.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  textAreaRef = createRef();
  submitButtonRef = createRef();

  handleCursor = (keylog, startSelect, endSelect) => {
    // log cursor position information
    keylog.CursorPosition.push(this.textAreaRef.current.selectionEnd);
    startSelect.push(this.textAreaRef.current.selectionStart);
    endSelect.push(this.textAreaRef.current.selectionEnd);
  };

  logCurrentText = (e) => {
    this.keylog.TextContent.push(e.target.value);
  };

  handleKeyDown = (e) => {
    console.log("keydown event fired!");
    console.log(e.key);
    let d_press = new Date();
    this.keylog.EventTime.push(d_press.getTime() - this.taskonset); // start time

    this.EventID = this.EventID + 1;
    this.keylog.EventID.push(this.EventID);

    // Add a unique RowKey
    this.keylog.RowKey.push(this.sessionQuiz + "-" + String(this.EventID));

    /// when logging space, it is better to use the letter space for the output column
    if (e.key === " ") {
      this.keylog.Output.push("Space");
    } else {
      this.keylog.Output.push(e.key);
    }

    this.logCurrentText(e);
    this.handleCursor(this.keylog, this.startSelect, this.endSelect);

    // use a customized function to detect and record different activities and the according text changes these activities bring about
    ActivityDetector(
      this.keylog,
      this.startSelect,
      this.endSelect,
      this.ActivityCancel,
      this.TextChangeCancel
    );
    // console.log(textNow);
  };

  handleMouseClick = (e) => {
    let mouseDown_m = new Date();
    let MouseDownTime = mouseDown_m.getTime() - this.taskonset;

    this.EventID = this.EventID + 1;
    this.keylog.EventID.push(this.EventID);

    // Add a unique RowKey
    this.keylog.RowKey.push(this.sessionQuiz + "-" + String(this.EventID));

    //////Start logging for this current click down event
    this.keylog.EventTime.push(MouseDownTime); // starttime
    if (e.button === 0) {
      this.keylog.Output.push("Leftclick");
    } else if (e.button === 1) {
      this.keylog.Output.push("Middleclick");
    } else if (e.button === 2) {
      this.keylog.Output.push("Rightclick");
    } else {
      this.keylog.Output.push("Unknownclick");
    }

    this.logCurrentText(e);
    // log cursor position
    this.handleCursor(this.keylog, this.startSelect, this.endSelect);
    /////// use a customized function to detect and record different activities and the according text changes these activities bring about
    ActivityDetector(
      this.keylog,
      this.startSelect,
      this.endSelect,
      this.ActivityCancel,
      this.TextChangeCancel
    );
  };
  handleTouch = (e) => {
    let d_press = new Date();
    this.keylog.EventTime.push(d_press.getTime() - this.taskonset); // start time

    this.EventID = this.EventID + 1;
    this.keylog.EventID.push(this.EventID);

    // Add a unique RowKey
    this.keylog.RowKey.push(this.sessionQuiz + "-" + String(this.EventID));

    if (e.key === " ") {
      this.keylog.Output.push("Space");
    } else if (e.key === "Unidentified") {
      this.keylog.Output.push("UnknownTouch");
    } else {
      this.keylog.Output.push(e.key);
    }

    this.keylog.TextContent.push(String(this.textAreaRef.current.value));
    // log cursor position
    this.handleCursor(this.keylog, this.startSelect, this.endSelect);

    /////// use a customized function to detect and record different activities and the according text changes these activities bring about
    ActivityDetector(
      this.keylog,
      this.startSelect,
      this.endSelect,
      this.ActivityCancel,
      this.TextChangeCancel
    );
  };

  handleSubmit = () => {
    // e.preventDefault(); // to prevent a browser refresh or reload
    if (this.EventID === 0) {
      this.keylog = {
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
      this.keylog.TaskOnSet.push(this.taskonset); //record task onset time

      ///// adjust the keylog data
      // record current text
      this.keylog.TextContent.push(String(this.textAreaRef.current.value));
      // record the final product
      this.keylog.FinalProduct = String(this.keylog.TextContent.slice(-1));

      // log cursor position
      this.handleCursor(this.keylog, this.startSelect, this.endSelect);
      /////// use a customized function to detect and record different activities and the according text changes these activities bring about
      ActivityDetector(
        this.keylog,
        this.startSelect,
        this.endSelect,
        this.ActivityCancel,
        this.TextChangeCancel
      );

      //Add PartitionKey
      this.keylog.PartitionKey.push(this.userId);

      //Textchange and Activity adjustment
      this.keylog.TextChange.shift();
      this.keylog.Activity.shift();

      // cursor information adjustment
      this.keylog.CursorPosition.shift();

      let d_end = new Date();
      let taskend = d_end.getTime();
      this.keylog.TaskEnd.push(taskend); //record task end time

      //post the data to the serve and lead to the next page
      let keylog_eedi = {
        PartitionKey: this.keylog.PartitionKey.toString(),
        RowKey: this.keylog.RowKey.join(),
        EventID: this.keylog.EventID.join(),
        EventTime: this.keylog.EventTime.join(),
        Output: this.keylog.Output.join("<=@=>"),
        CursorPosition: this.keylog.CursorPosition.join(),
        TextChange: this.keylog.TextChange.join("<=@=>"),
        Activity: this.keylog.Activity.join("<=@=>"),
      };

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(keylog_eedi),
      };
      console.log(keylog_eedi);
      fetch(this.endpoint, options) // Replace the local host with the end point.
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
      this.keylog.PartitionKey = [];
      this.keylog.RowKey = [];
      this.keylog.EventID = [];
      this.keylog.EventTime = [];
      this.keylog.FinalProduct = [];
      this.keylog.CursorPosition = [];
      this.keylog.Output = [];
      this.keylog.TaskEnd = [];
      this.keylog.TaskOnSet = [];
      this.keylog.TextChange = [];
      this.keylog.Activity = [];
      this.keylog.TextContent = [];
      this.EventID = 0;
    }

    // reset variables
    this.EventID = 0;
    this.startSelect = [];
    this.endSelect = [];
    this.ActivityCancel = []; // to keep track of changes caused by control + z
    this.TextChangeCancel = []; // to keep track of changes caused by control + z

    console.log(
      `Inner submit! e.g. submit the keystroke logging data... (your code) for ${this.sessionId}`
    );
  };

  componentDidMount() {
    const isInput =
      this.textAreaRef.current &&
      this.textAreaRef.current.tagName === "TEXTAREA";
    const isButton =
      this.submitButtonRef.current &&
      this.submitButtonRef.current.tagName === "BUTTON";

    if (isInput) {
      this.textAreaRef.current.addEventListener("keydown", (e) => {
        console.log("I hear a keydown event.");
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          this.handleSubmit();
        } else {
          this.handleKeyDown(e);
        }
      });
      this.textAreaRef.current.addEventListener(
        "mousedown",
        this.handleMouseClick
      );
      // for touch screen devices, event listener needs to be added to the whole document.
      document.addEventListener("touchstart", (e) => {
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          this.handleSubmit();
        } else {
          this.handleTouch(e);
        }
      });
    }

    if (isButton) {
      this.submitButtonRef.current.addEventListener("click", this.handleSubmit);
    }
  }

  componentWillUnmount() {
    const isInput =
      this.textAreaRef.current &&
      this.textAreaRef.current.tagName === "TEXTAREA";
    const isButton =
      this.submitButtonRef.current &&
      this.submitButtonRef.current.tagName === "BUTTON";

    if (isInput) {
      this.textAreaRef.current.removeEventListener("keydown", (e) => {
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          this.handleSubmit();
        } else {
          this.handleKeyDown(e);
        }
      });
      this.textAreaRef.current.removeEventListener(
        "mousedown",
        this.handleMouseClick
      );
      // for touch screen devices, event listener needs to be added to the whole document.
      document.removeEventListener("touchstart", (e) => {
        if (
          e.key === "Enter" &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey &&
          !e.metaKey
        ) {
          this.handleSubmit();
        } else {
          this.handleTouch(e);
        }
      });
    }

    if (isButton) {
      this.submitButtonRef.current.removeEventListener(
        "click",
        this.handleSubmit
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          <textarea ref={this.textAreaRef}></textarea>
          <button ref={this.submitButtonRef} type="submit">
            Send!
          </button>
        </div>
      </div>
    );
  }
}

export default KeyStrokeLogger;
