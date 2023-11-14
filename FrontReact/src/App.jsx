import { useRef } from "react";
import { useKeyStrokeLogger } from "./useKeyStrokeLogger";

const SampleInput = () => {
  const textAreaRef = useRef(null);
  const submitButtonRef = useRef(null);

  useKeyStrokeLogger({
    textAreaRef,
    submitButtonRef,
    sessionId: 2023,
    userId: 12345,
    quizId: 1106,
    endpoint: "http://localhost:8000", //local host of the fastAPI
    token: "asd235423423$_sdf2345sdf", // key chain  third-party authentication  attach to the call to endpoint()
  });

  return (
    <div>
      <div>
        <textarea ref={textAreaRef}></textarea>
        <button ref={submitButtonRef} type="submit">
          Send!
        </button>
      </div>
    </div>
  );
};

export default SampleInput;
