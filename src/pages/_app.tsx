import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"
import { RecoilRoot } from 'recoil'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Head>
        <title>VibeCode</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="Practice and master the art of generative AI-assisted programming. Solve challenges, hone your prompting skills, and prepare for the future of software engineering." />
        <meta name="keywords" content="AI coding, generative AI, programming, interview prep, vibe coding, prompt engineering, LeetCode, software development" />
        <meta name="author" content="Ayush Pathak" />
      </Head>
      <ToastContainer />
      <Component {...pageProps} />
    </RecoilRoot>
  )
}
