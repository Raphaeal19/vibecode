import Link from "next/link";
import React, { useEffect } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { AiFillYoutube } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import YouTube from "react-youtube";
import { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, firebase } from "@/firebase/firebase";
import { DBProblem } from "@/utils/types/problem";
import { useAuthState } from "react-firebase-hooks/auth";

type ProblemsTableProps = {
  setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>;
};

const ProblemsTable: React.FC<ProblemsTableProps> = (setLoadingProblems) => {
  const [youtubePlayer, setYoutubePlayer] = useState({
    isOpen: false,
    videoId: "",
  });

  const problems = useGetProblems(setLoadingProblems.setLoadingProblems);
  const solvedProblems = useGetSolvedProblems();
  // console.log(solvedProblems)

  const closeModal = () => {
    setYoutubePlayer({ isOpen: false, videoId: "" });
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && youtubePlayer.isOpen) {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <tbody className="text-white">
        {problems.map((problem, idx) => {
          const difficultyColor =
            problem.difficulty === "Easy"
              ? "text-green-500"
              : problem.difficulty === "Medium"
              ? "text-dark-yellow"
              : "text-dark-pink";
          return (
            <tr
              className={`${idx % 2 === 1 ? "bg-dark-layer-1" : ""}`}
              key={problem.id}
            >
              <th className="px-2 py-4 font-medium whitepace-nowrap text-dark-green-s">
                {solvedProblems.includes(problem.id) && <BsCheckCircle fontSize={"18"} width={"18"}></BsCheckCircle>}
              </th>
              <td className="px-6 py-4">
                {problem.link ? (
                  <Link
                    className="hover:text-blue-600 cursor-pointer"
                    href={`${problem.link}`}
                    target="_blank"
                  >
                    {problem.title}
                  </Link>
                ) : (
                  <Link
                    className="hover:text-blue-600 cursor-pointer"
                    href={`/problems/${problem.id}`}
                  >
                    {problem.title}
                  </Link>
                )}
              </td>
              <td className={`px-6 py-4 ${difficultyColor}`}>
                {problem.difficulty}
              </td>
              <td className="px-6 py-4">{problem.category}</td>
              <td className="px-6 py-4">
                {problem.videoId ? (
                  <div>
                    <AiFillYoutube
                      fontSize={"18"}
                      className="cursor-pointer text-red-600 hover:text-red-500"
                      onClick={() =>
                        setYoutubePlayer({
                          isOpen: true,
                          videoId: problem.videoId as string,
                        })
                      }
                    />
                  </div>
                ) : (
                  <span className="text-gray-500">No Video</span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
      {youtubePlayer.isOpen ? (
        <tfoot className="fixed top-0 left-0 h-screen w-screen flex items-center justify-center">
          <div
            className="bg-black z-10 opacity-70 top-0 left-0 w-screen h-screen absolute"
            onClick={closeModal}
          ></div>
          <div className="w-full z-50 h-full px-6 relative max-w-4xl">
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="w-full relative">
                <IoClose
                  className="cursor-pointer absolute -top-16 right-0"
                  fontSize={"35"}
                  onClick={closeModal}
                />
                <YouTube
                  videoId={youtubePlayer.videoId}
                  loading="lazy"
                  iframeClassName="w-full min-h-[500px]"
                />
              </div>
            </div>
          </div>
        </tfoot>
      ) : null}
    </>
  );
};
export default ProblemsTable;

function useGetProblems(
  setLoadingProblems: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [problems, setProblems] = useState<DBProblem[]>([]);

  useEffect(() => {
    const getProblems = async () => {
      setLoadingProblems(true);
      const q = query(
        collection(firebase, "problems"),
        orderBy("order", "asc")
      );
      const querySnapshot = await getDocs(q);
      const tmp: DBProblem[] = [];
      querySnapshot.forEach((doc) => {
        tmp.push({
          id: doc.id,
          ...doc.data(),
        } as DBProblem);
      });
      setLoadingProblems(false);
      setProblems(tmp);
    };

    getProblems();
  }, [setLoadingProblems]);

  return problems;
}

function useGetSolvedProblems() {
  const [solvedProblems, setSovledProblems] = useState<string[]>([]);
  const [user] = useAuthState(auth);
  useEffect(() => {
    const getSolvedProblems = async () => {
      const userRef = doc(firebase, "users", user!.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        setSovledProblems(userDoc.data().solvedProblems);
      }
    };
    if (user) getSolvedProblems();
    if (!user) setSovledProblems([]);
  }, [user]);
  return solvedProblems;
}
