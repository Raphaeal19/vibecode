import ProblemsTable from "@/components/ProblemsTable/ProblemsTable";
import Topbar from "@/components/Topbar/Topbar";
import useHasMounted from "@/hooks/useHasMounted";
import { useState } from "react";
// import { doc, setDoc } from "firebase/firestore";
// import { firebase } from "@/firebase/firebase";
// import { useState } from "react";
// import { problems } from "@/mockProblems/problems";

export default function Home() {
  // //TODO: this is only used for default state, change this to something more intelligent
  // const [inputs, setInputs] = useState({
  //   id: "",
  //   title: "",
  //   difficulty: "",
  //   category: "",
  //   likes: 0,
  //   dislikes: 0,
  //   order: 0,
  //   videoId: "",
  //   link: "",
  // });

  // const handleSaveAllProblems = async () => {
  //   try {
  //     const promises = problems.map((problem) => {
  //       const probRef = doc(firebase, "problems", problem.id);
  //       const order = parseInt(problem.order);
  //       const newProblem = {
  //         ...inputs,
  //         ...problem,
  //         order: order,
  //       };
  //       return setDoc(probRef, newProblem);
  //     });
  //     await Promise.all(promises);
  //     alert("Saved all problems");
  //   } catch (error) {}
  // };

  const [loadingProblems, setLoadingProblems] = useState(true);
  const hasMounted = useHasMounted();

  if(!hasMounted) return null;

  return (
    <>
      <main className="bg-dark-layer-2 min-h-screen">
        <Topbar />
        <h1 className="text-2xl text-center text-gray-700 dark:text-gray-400 font-medium mt-10 mb-5">
          Welcome to VibeCode - Code your Imagination!
        </h1>
        <div className="relative overflow-x-auto mx-auto px-6 pb-10">
          {loadingProblems && (
            <div className="max-w-[1200px] mx-auto sm:w-7/12 w-full animate-pulse">
              {[...Array(10)].map((_, index) => (
                <LoadingSkeleton key={index} />
              ))}
            </div>
          )}
          <table className="text-sm text-left text-gray-500 dark:text-gray-400 sm:w-7/12 w-full max-w-[1200px] mx-auto">
            {!loadingProblems && (
              <thead className="text-xs text-gray-700 uppercase dark:text-gray-400 border-b">
                <tr>
                  <th scope="col" className="px-1 py-3 w-0 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-1 py-3 w-0 font-medium">
                    Title
                  </th>
                  <th scope="col" className="px-1 py-3 w-0 font-medium">
                    Difficulty
                  </th>
                  <th scope="col" className="px-1 py-3 w-0 font-medium">
                    Category
                  </th>
                  <th scope="col" className="px-1 py-3 w-0 font-medium">
                    Solution
                  </th>
                </tr>
              </thead>
            )}
            <ProblemsTable setLoadingProblems={setLoadingProblems} />
          </table>
        </div>

        {/* <div
          className="p-6 flex flex-col max-w-sm gap-3"
        >
          <button onClick={handleSaveAllProblems} className="bg-white">save to db</button>
        </div> */}
      </main>
    </>
  );
}

const LoadingSkeleton = () => {
  return (
    <div className="flex items-center space-x-12 mt-4 px-6">
      <div className="w-6 h-6 shrink-0 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32  rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52  w-32 rounded-full bg-dark-layer-1"></div>
      <div className="h-4 sm:w-52 w-32 rounded-full bg-dark-layer-1"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
