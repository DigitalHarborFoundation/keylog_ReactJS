# Keystroke logging package: the ReactJS version

To use the keystroke logger hook:

1. Refer to `App.jsx` to see how the hook is implemented in a React app.
2. Make sure you do the following things before implement the package in your app:
   - [a]. Set the perimeters in the `useKeyStrokeLogger` hook according to your use case. `userId` defines the id of the user; `sessionId` should be used to identify the session of the questions. `quizID` stores the id of the specific question in the session; `endpoint` specifies the API endpoint that accepts and handles the posted keystroke data.
   - [b]. Change the value of `taskonset` (default is 0). `taskonset` should be able to record the time when a question is posted in the chatbot. This information is used to calculate the time a user uses before he/she starts responding to the question.
   - [c]. Put the `textAreaRef` and `submitButtonRef` in the correct places in your app. The former is used to listen to keystroke and mouse click events in a text area while the latter is used to listen to button click events.
