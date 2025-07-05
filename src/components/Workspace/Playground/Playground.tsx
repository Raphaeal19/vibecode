import React, { useEffect, useState } from "react";
import PreferenceNav from "./PreferenceNav/PreferenceNav";
import Split from "react-split";
import Editor from "@monaco-editor/react";
import EditorFooter from "./EditorFooter";
import { Problem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firebase } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { problems } from "@/utils/problems";
import { useRouter } from "next/router";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import useLocalStorage from "@/hooks/useLocalStorage";

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
  const [activeFile, setActiveFile] = useState(problem.files[0].name);
  const [userCode, setUserCode] = useState(problem.files[0].code);
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
      return;
    }

    // For now, we'll just leave the endpoint open
    console.log("Submitting code:", userCode);
  };

  useEffect(() => {
    const file = problem.files.find((file) => file.name === activeFile);
    if (file) {
      setUserCode(file.code);
    }
  }, [activeFile, problem.files]);

  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setUserCode(value);
      const newFiles = problem.files.map((file) => {
        if (file.name === activeFile) {
          return { ...file, code: value };
        }
        return file;
      });
      // This is a temporary solution to update the problem state.
      // A more robust solution would involve a state management library.
      (problem as any).files = newFiles;
    }
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
          <div className="flex bg-dark-layer-2">
            {problem.files.map((file) => (
              <button
                key={file.name}
                className={`px-4 py-2 text-sm font-medium ${
                  activeFile === file.name
                    ? "bg-dark-layer-1 text-white"
                    : "bg-dark-layer-2 text-gray-400"
                }`}
                onClick={() => setActiveFile(file.name)}
              >
                {file.name}
              </button>
            ))}
          </div>
          <Editor
            height="100%"
            language="typescript"
            theme="vs-dark"
            value={userCode}
            onChange={handleEditorChange}
            options={{ fontSize: parseInt(settings.fontSize) }}
          />
        </div>
        <div className="w-full overflow-auto relative flex flex-col h-full ">
          <div className="flex-1 overflow-y-auto ml-5 my-2">
            {/* testcases */}
            <div className="flex h-10 items-center space-x-6">
              <div className="relative flex h-full flex-col justify-center cursor-pointer">
                <div className="text-sm font-medium leading-5 text-white">
                  Testcases
                </div>
                <hr className="absolute bottom-0 h-0.5 w-full rounded-full border-none bg-white" />
              </div>
            </div>

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

            <div className="font-semibold mr-5 my-4">
              <p className="text-sm font-medium mt-4 text-white">Input: </p>
              <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
                {problem.examples[activeTestCaseId].inputText}
              </div>
              <p className="text-sm font-medium mt-4 text-white">Output: </p>
              <div className="w-full cursor-text rounded-lg border px-3 py-[10px] bg-dark-fill-3 border-transparent text-white mt-2">
                {problem.examples[activeTestCaseId].outputText}
              </div>
            </div>
          </div>
          <EditorFooter handleSubmit={handleSubmit} />
        </div>
      </Split>
    </div>
  );
};
export default Playground;
