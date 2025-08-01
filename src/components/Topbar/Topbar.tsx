import { auth } from "@/firebase/firebase";
import Link from "next/link";
import React, { use } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Logout from "../Buttons/Logout";
import { useRecoilState } from "recoil";
import { authModalState } from "@/atoms/authModalAtom";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { BsList } from "react-icons/bs";
import { FiSettings } from "react-icons/fi";
import Timer from "../Timer/Timer";
import { useRouter } from "next/router";
import { problems } from "@/utils/problems";
import { Problem } from "@/utils/types/problem";

type TopbarProps = {
  problemPage?: boolean;
};

const Topbar: React.FC<TopbarProps> = ({ problemPage }) => {
  const [user] = useAuthState(auth);
  const [, setAuthModalState] = useRecoilState(authModalState);
  const router = useRouter();

  const handleProblemChange = (isForward: boolean) => {
    const { order } = problems[router.query.pid as string] as Problem;
    const direction = isForward ? 1 : -1;
    const nextProblemOrder = order + direction;
    const nextProblemKey = Object.keys(problems).find(key => problems[key].order === nextProblemOrder)
    if (isForward && !nextProblemKey){
      const firstProblemKey = Object.keys(problems).find(key => problems[key].order === 1)
      router.push(`/problems/${firstProblemKey}`)
    }
    else if (!isForward && !nextProblemKey){
      const lastProblemKey = Object.keys(problems).find(key => problems[key].order === Object.keys(problems).length)
      router.push(`/problems/${lastProblemKey}`)
    }
    else{
      router.push(`/problems/${nextProblemKey}`)
    }
  }

  return (
    <nav className="relative flex h-[60px] w-full shrink-0 items-center bg-dark-layer-1 text-dark-gray-7">
      <div className={`flex w-full items-center justify-between ${!problemPage ? 'max-w-[1200px] mx-auto': ""} px-5`}>
        {/* left */}
        <Link href={"/"} className="h-[22px]">
          <Image
            src="/logo-full.png"
            alt="VibeCode Logo"
            width={50}
            height={50}
            className="h-full"
          />
        </Link>

        {/* middle */}
        {problemPage && (
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleProblemChange(false)}
            >
              <FaChevronLeft />
            </div>
            <Link
              href={"/"}
              className="flex items-center gap-2 font-medium max-w-[170px] text-dark-gray-8 cursor-pointer"
            >
              <BsList />
              <span>Problem List</span>
            </Link>
            <div className="flex items-center justify-center rounded bg-dark-fill-3 hover:bg-dark-fill-2 h-8 w-8 cursor-pointer"
              onClick={() => handleProblemChange(true)}
            >
              <FaChevronRight />
            </div>
          </div>
        )}

        {/* right */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.ayushpathak.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-dark-fill-3 py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-3"
          >
            Get in Touch
          </a>
          {user && problemPage && <Timer />}
          {!user ? (
            <Link
              href={"/auth"}
              onClick={() => {
                setAuthModalState((prev) => ({
                  ...prev,
                  isOpen: true,
                  type: "login",
                }));
              }}
            >
              <button className="bg-dark-fill-3 py-1 px-2 cursor-pointer rounded">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="cursor-pointer group relative">
              <img
                src={user.photoURL || "/avatar.png"}
                alt="User Avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="absolute top-10 left-1/2 -translate-x-1/2 mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 transition-all duration-300 ease-in-out">
                <p className="text-sm">{user.email}</p>
                <Link href="/profile" className="flex items-center gap-2 mt-2 hover:text-white transition-colors">
                  <FiSettings className="text-sm" />
                  <span className="text-sm">Settings</span>
                </Link>
              </div>
            </div>
          )}
          {user ? <Logout /> : null}
        </div>
      </div>
    </nav>
  );
};
export default Topbar;
