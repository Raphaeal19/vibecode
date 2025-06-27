import React, { useEffect, useState } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { javascript } from "@codemirror/lang-javascript";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firebase } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { problems } from "@/utils/problems";
import { useRouter } from "next/router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { python } from "@codemirror/lang-python";
import useLocalStorage from "@/hooks/useLocalStorage";
import AIChatPanel from "../AIChatPanel";

type PlaygroundProps = {
  problem: Problem;
  setSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSolved: React.Dispatch<React.SetStateAction<boolean>>;
};

export interface ISettings {
  fontSize: string;
  settingsModalIsOpen: boolean;
  dropdownIsOpen: boolean;
}

const Playground: React.FC<PlaygroundProps> = ({
  problem,
  setSuccess,
  setSolved,
}) => {
  const [activeTestCaseId, setActiveTestCaseId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"testcases" | "ai">("testcases");
  let [userCode, setUserCode] = useState<string>(problem.starterCode);
  const [fontSize, setFontSize] = useLocalStorage("vc-font-size", "16px");
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { pid } = router.query;

  const [settings, setSettings] = useState<ISettings>({
    fontSize: fontSize,
    settingsModalIsOpen: false,
    dropdownIsOpen: false,
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please login to submit code", {
        position: "top-center",
        theme: "dark",
        autoClose: 3000,
      });
    }

    try {
      userCode = userCode.slice(userCode.indexOf(problem.starterFunctionName));
      // console.log(userCode)
      const cb = new Function(`return ${userCode}`)();
      const handler = problems[pid as string].handlerFunction;
      if (typeof handler === "function") {
        const success = handler(cb);
        if (success) {
          toast.success("Congrats! Your code has passed all test cases", {
            position: "top-center",
            theme: "dark",
            autoClose: 3000,
          });
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
          }, 4000);

          const userRef = doc(firebase, "users", user!.uid);
          await updateDoc(userRef, {
            solvedProblems: arrayUnion(pid),
          });
          setSolved(true);
        }
      }
    } catch (error: any) {
      // console.log(error);
      if (error.message.startsWith("AssertionError [ERR_ASSERTION]")) {
        toast.error("Your code has failed some test cases", {
          position: "top-center",
          theme: "dark",
          autoClose: 3000,
        });
      } else {
        toast.error("Something went wrong" + error.message, {
          position: "top-center",
          theme: "dark",
          autoClose: 3000,
        });
      }
    }
  };

  useEffect(() => {
    const storedCode = localStorage.getItem(`code-${pid}`);
    if (user) {
      setUserCode(storedCode ? JSON.parse(storedCode) : problem.starterCode);
    } else {
      setUserCode(problem.starterCode);
    }
  }, [pid, user, problem.starterCode]);

  const onChange = (value: string) => {
    setUserCode(value);
    localStorage.setItem(`code-${pid}`, JSON.stringify(value));
  };

  return (
    <div className="flex flex-col bg-dark-layer-1 relative">
      <PreferenceNav settings={settings} setSettings={setSettings} />
      <Split
        className="h-[calc(100vh-94px)]"
        direction="vertical"
        sizes={[60, 40]}
        minSize={60}
      >
        <div className="w-full overflow-auto">
          <CodeMirror
            value={userCode}
            theme={vscodeDark}
            onChange={onChange}
            extensions={[javascript(), python()]}
            style={{ fontSize: settings.fontSize }}
          />
        </div>
        <div className="w-full flex flex-col relative h-full">
          {/* tab navigation */}
          <div className="flex h-10 items-center space-x-6 px-5">
            <div
              className={`relative flex h-full flex-col justify-center cursor-pointer ${
                activeTab === "testcases" ? "text-white" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("testcases")}
            >
              <div className="text-sm font-medium leading-5">Test cases</div>
              {activeTab === "testcases" && (
                <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
              )}
            </div>
            <div
              className={`relative flex h-full flex-col justify-center cursor-pointer ${
                activeTab === "ai" ? "text-white" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("ai")}
            >
              <div className="text-sm font-medium leading-5">AI Assistant</div>
              {activeTab === "ai" && (
                <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
              )}
            </div>
          </div>

          {/* tab content */}
          <div className="overflow-y-auto flex-1 p-5 pb-14">
            {activeTab === "testcases" && (
              <>
                <div className="flex">
                  {problem.examples.map((example, index) => (
                    <div
                      className="mr-2 items-start mt-2 text-white"
                      key={example.id}
                      onClick={() => setActiveTestCaseId(index)}
                    >
                      <div className="flex flex-wrap items-center gap-y-4">
                        <div
                          className={`font-medium items-center transition-all focus:outline-none inline-flex bg-dark-fill-3 hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 cursor-pointer whitespace-nowrap
                        ${
                          activeTestCaseId === index
                            ? "text-white"
                            : "text-gray-500"
                        }
                      `}
                        >
                          Case {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="font-semibold my-4">
                  <p className="text-sm font-medium mt-4 text-white">Input: </p>
                  <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
                    {problem.examples[activeTestCaseId].inputText}
                  </div>
                  <p className="text-sm font-medium mt-4 text-white">Output: </p>
                  <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
                    {problem.examples[activeTestCaseId].outputText}
                  </div>
                </div>
              </>
            )}

            {activeTab === "ai" && (
              <div className="mt-4 h-full">
                <AIChatPanel problemId={problem.id} />
              </div>
            )}
          </div>
          <EditorFooter handleSubmit={handleSubmit} />
        </div>
      </Split>
    </div>
  );
};
export default Playground;
