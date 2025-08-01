import CircleSkeleton from "@/components/Skeletons/CircleSkeleton";
import RectangleSkeleton from "@/components/Skeletons/RectangleSkeleton";
import { auth, firebase } from "@/firebase/firebase";
import { DBProblem, Problem } from "@/utils/types/problem";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  AiFillLike,
  AiFillDislike,
  AiOutlineLoading3Quarters,
  AiFillStar,
} from "react-icons/ai";
import { BsCheck2Circle } from "react-icons/bs";
import { TiStarOutline } from "react-icons/ti";
import { toast } from "react-toastify";

type ProblemDescriptionProps = {
  problem: Problem;
  _solved: boolean;
};

const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem,
  _solved,
}) => {
  const [user] = useAuthState(auth);
  const { currentProblem, loading, problemDifficultyClass, setCurrentProblem } =
    useGetCurrentProblem(problem.id);
  const { liked, disliked, starred, solved, setUsersData } =
    useGetUsersDataOnProblem(problem.id);

  if (!problem) {
    return <div>Loading problem details...</div>; // Or some other loading/error state
  }

  const returnUserDataAndProblemData = async (transaction: any) => {
    const userRef = doc(firebase, "users", user!.uid);
    const problemRef = doc(firebase, "problems", problem.id);
    const userDoc = await transaction.get(userRef);
    const problemDoc = await transaction.get(problemRef);
    return { userDoc, problemDoc, userRef, problemRef };
  };
  const [updatingLikes, setUpdatingLikes] = useState<boolean>(false);
  const [updatingDislikes, setUpdatingDislikes] = useState<boolean>(false);
  const [updatingStarred, setUpdatingStarred] = useState<boolean>(false);
  const [updatingSolved, setUpdatingSolved] = useState<boolean>(false);

  const handleLike = async () => {
    if (!user) {
      toast.error("You must be logged in to like a problem", {
        position: "top-center",
        theme: "dark",
      });
      return;
    }
    if (updatingLikes) return;
    setUpdatingLikes(true);
    await runTransaction(firebase, async (transaction) => {
      const { userDoc, problemDoc, userRef, problemRef } =
        await returnUserDataAndProblemData(transaction);
      if (userDoc.exists() && problemDoc.exists()) {
        if (liked) {
          //remove problem id from likedProblems on user document, decrement liked on problem document
          transaction.update(userRef, {
            likedProblems: userDoc
              .data()
              .likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes - 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, likes: prev.likes - 1 } : null
          );
          setUsersData((prev) => ({ ...prev, liked: false }));
        } else if (disliked) {
          //remove problem id from dislikedProblems on user document
          transaction.update(userRef, {
            likedProblems: [...userDoc.data().likedProblems, problem.id],
            dislikedProblems: userDoc
              .data()
              .dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes + 1,
            dislikes: problemDoc.data().dislikes - 1,
          });
          setCurrentProblem((prev) =>
            prev
              ? {
                  ...prev,
                  likes: prev.likes + 1,
                  dislikes: prev.dislikes - 1,
                }
              : null
          );
          setUsersData((prev) => ({ ...prev, liked: true, disliked: false }));
        } else {
          //add problem id to likedProblems on user document, increment liked on problem document
          transaction.update(userRef, {
            likedProblems: [...userDoc.data().likedProblems, problem.id],
          });
          transaction.update(problemRef, {
            likes: problemDoc.data().likes + 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, likes: prev.likes + 1 } : null
          );
          setUsersData((prev) => ({ ...prev, liked: true }));
        }
      }
    });
    setUpdatingLikes(false);
  };

  const handleDislike = async () => {
    if (!user) {
      toast.error("You must be logged in to dislike a problem", {
        position: "top-center",
        theme: "dark",
      });
      return;
    }
    if (updatingDislikes) return;
    setUpdatingDislikes(true);
    await runTransaction(firebase, async (transaction) => {
      const { userDoc, problemDoc, userRef, problemRef } =
        await returnUserDataAndProblemData(transaction);
      if (userDoc.exists() && problemDoc.exists()) {
        if (disliked) {
          //remove problem id from dislikedProblems on user document
          transaction.update(userRef, {
            dislikedProblems: userDoc
              .data()
              .dislikedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes - 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, dislikes: prev.dislikes - 1 } : null
          );
          setUsersData((prev) => ({ ...prev, disliked: false }));
        } else if (liked) {
          //remove problem id from likedProblems on user document
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data().dislikedProblems, problem.id],
            likedProblems: userDoc
              .data()
              .likedProblems.filter((id: string) => id !== problem.id),
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes + 1,
            likes: problemDoc.data().likes - 1,
          });
          setCurrentProblem((prev) =>
            prev
              ? {
                  ...prev,
                  dislikes: prev.dislikes + 1,
                  likes: prev.likes - 1,
                }
              : null
          );
          setUsersData((prev) => ({ ...prev, disliked: true, liked: false }));
        } else {
          //add problem id to dislikedProblems on user document
          transaction.update(userRef, {
            dislikedProblems: [...userDoc.data().dislikedProblems, problem.id],
          });
          transaction.update(problemRef, {
            dislikes: problemDoc.data().dislikes + 1,
          });
          setCurrentProblem((prev) =>
            prev ? { ...prev, dislikes: prev.dislikes + 1 } : null
          );
          setUsersData((prev) => ({ ...prev, disliked: true }));
        }
      }
    });
    setUpdatingDislikes(false);
  };

  const handleStarred = async () => {
    if (!user) {
      toast.error("You must be logged in to star a problem", {
        position: "top-center",
        theme: "dark",
      });
      return;
    }

    setUpdatingStarred(true);
    const userRef = doc(firebase, "users", user!.uid);

    if (!starred) {
      await updateDoc(userRef, {
        starredProblems: arrayUnion(problem.id),
      });
      setUsersData((prev) => ({ ...prev, starred: true }));
    } else {
      await updateDoc(userRef, {
        starredProblems: arrayRemove(problem.id),
      });
      setUsersData((prev) => ({ ...prev, starred: false }));
    }
    setUpdatingStarred(false);
  };

  return (
    <div className="bg-dark-layer-1 ">
      {/* TAB */}
      <div className="flex h-11 w-full items-center pt-2 bg-dark-layer-2 text-white overflow-x-hidden">
        <div
          className={
            "bg-dark-layer-1 rounded-t-[5px] px-5 py-[10px] text-xs cursor-pointer"
          }
        >
          Description
        </div>
      </div>

      <div className="flex px-5 py-4 h-[calc(100vh-94px)] overflow-y-auto custom-scrollbar">
        <div className="px-5">
          {/* Problem heading */}
          <div className="w-full ">
            <div className="flex space-x-4">
              <div className="flex-1 mr-2 text-lg text-white font-medium">
                {problem.title}
              </div>
            </div>
            {!loading && currentProblem && (
              <div className="flex items-center mt-3">
                <div
                  className={`${problemDifficultyClass} inline-block rounded-[21px] bg-opacity-[.15] px-2.5 py-1 text-xs font-medium capitalize `}
                >
                  {currentProblem.difficulty}
                </div>
                {(solved || _solved) && (
                  <div className="rounded p-[3px] ml-4 text-lg transition-colors duration-200 text-green-s text-dark-green-s">
                    <BsCheck2Circle />
                  </div>
                )}
                <div
                  className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-dark-gray-6"
                  onClick={handleLike}
                >
                  {!updatingLikes && liked && (
                    <AiFillLike className="text-dark-blue-s" />
                  )}
                  {!liked && !updatingLikes && <AiFillLike />}
                  {updatingLikes && (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  )}
                  <span className="text-xs">{currentProblem?.likes}</span>
                </div>
                <div
                  className="flex items-center cursor-pointer hover:bg-dark-fill-3 space-x-1 rounded p-[3px]  ml-4 text-lg transition-colors duration-200 text-green-s text-dark-gray-6"
                  onClick={handleDislike}
                >
                  {!updatingDislikes && disliked && (
                    <AiFillDislike className="text-dark-blue-s" />
                  )}
                  {!disliked && !updatingDislikes && <AiFillDislike />}
                  {updatingDislikes && (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  )}
                  <span className="text-xs">{currentProblem?.dislikes}</span>
                </div>
                <div
                  className="cursor-pointer hover:bg-dark-fill-3  rounded p-[3px]  ml-4 text-xl transition-colors duration-200 text-green-s text-dark-gray-6 "
                  onClick={handleStarred}
                >
                  {starred && !updatingStarred && (
                    <AiFillStar className="text-dark-yellow" />
                  )}
                  {!starred && !updatingStarred && <AiFillStar />}
                  {updatingStarred && (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="mt-3 flex space-x-2">
                <RectangleSkeleton />
                <CircleSkeleton />
                <RectangleSkeleton />
                <RectangleSkeleton />
                <CircleSkeleton />
              </div>
            )}

            {/* Problem Statement(paragraphs) */}
            <div className="text-white text-sm">
              <div
                dangerouslySetInnerHTML={{
                  __html: problem.taskDescription || "",
                }}
              />
            </div>

            {/* Examples */}
            <div className="mt-4">
              {problem.examples.map((example, index) => (
                <div key={example.id}>
                  <p className="font-medium text-white">Example {index + 1}</p>
                  {example.img && (
                    <img src={example.img} alt="" className="mt-3" />
                  )}
                  <div className="example-card">
                    <pre>
                      <strong className="text-white">Input: </strong>{" "}
                      {example.inputText}
                      <br />
                      <strong className="text-white">Output: </strong>{" "}
                      {example.outputText}
                      <br />
                      {example.explanation && (
                        <>
                          <strong className="text-white">Explanation: </strong>{" "}
                          {example.explanation}
                        </>
                      )}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="my-8 pb-8">
              <div className="text-white text-sm font-medium">Constraints:</div>
              <ul className="text-white ml-5 list-disc">
                <div
                  dangerouslySetInnerHTML={{ __html: problem.constraints }}
                />
              </ul>
            </div>

            {/* Evaluation Criteria */}
            {problem.evaluationCriteria && (
              <div className="my-8 pb-8">
                <div className="text-white text-sm font-medium">
                  Evaluation Criteria:
                </div>
                <p className="text-white text-sm">Your solution will be evaluated based on the following:</p>
                <ul className="text-white text-sm ml-5 list-disc">
                  <div
                    className="text-white text-sm mt-2"
                    dangerouslySetInnerHTML={{
                      __html: problem.evaluationCriteria,
                    }}
                  />
                </ul>
              </div>
            )}

            {/* Hints */}
            {problem.hints && problem.hints.length > 0 && (
              <div className="my-8 pb-8">
                <div className="text-white text-sm font-medium">Hints:</div>
                <ul className="text-white ml-5 list-disc">
                  {problem.hints.map((hint, index) => (
                    <div className="text-white text-sm" dangerouslySetInnerHTML={{ __html: hint }} key={index}></div>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProblemDescription;

function useGetCurrentProblem(problemId: string) {
  const [currentProblem, setCurrentProblem] = useState<DBProblem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [problemDifficultyClass, setProblemDifficultyClass] =
    useState<string>("");

  useEffect(() => {
    //get problem from DB
    const getCurrentProblem = async () => {
      setLoading(true);
      const docRef = doc(firebase, "problems", problemId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const problem = docSnap.data();
        setCurrentProblem({ id: docSnap.id, ...problem } as DBProblem);
        setProblemDifficultyClass(
          problem.difficulty === "Easy"
            ? "bg-olive text-olive"
            : problem.difficulty === "Medium"
            ? "bg-dark-yellow text-dark-yellow"
            : " bg-dark-pink text-dark-pink"
        );
      }
      setLoading(false);
    };
    getCurrentProblem();
  }, [problemId]);
  return { currentProblem, loading, problemDifficultyClass, setCurrentProblem };
}

function useGetUsersDataOnProblem(problemId: string) {
  const [usersData, setUsersData] = useState({
    liked: false,
    disliked: false,
    starred: false,
    solved: false,
  });
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchUsersDataOnProblem = async () => {
      const userRef = doc(firebase, "users", user!.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        const {
          solvedProblems,
          likedProblems,
          dislikedProblems,
          starredProblems,
        } = data;
        setUsersData({
          liked: likedProblems.includes(problemId),
          disliked: dislikedProblems.includes(problemId),
          starred: starredProblems.includes(problemId),
          solved: solvedProblems.includes(problemId),
        });
      }
    };
    if (user) fetchUsersDataOnProblem();

    return () => {
      setUsersData({
        liked: false,
        disliked: false,
        starred: false,
        solved: false,
      });
    };
  }, [problemId, user]);

  return { ...usersData, setUsersData };
}
