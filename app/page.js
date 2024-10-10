"use client";
// import { TextGenerateEffect } from "../ui/text-generate-effect";
import Footer from "@/components/Footer";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function Home() {
  const words = `Turning Vision Into Reality With Code And Design.`;

  return (
    <>
      <Navbar />
      <main className="relative flex flex-col md:flex-row justify-center items-center max-w-[1200px] mx-auto sm:px-16 px-5 py-5">
        {/* Hero Section */}
        <section className="w-full md:w-1/2 mb-5 md:mb-0 flex justify-center md:justify-start">
          <Image
            src="/images/profile/developer-pic-1.png"
            alt="Profile picture of the developer"
            width={500}
            height={500}
            className="object-cover rounded-full"
          />
        </section>

        <section className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <h1>
            <TextGenerateEffect words={words} />
          </h1>

          <p className="my-6 text-gray-500 md:text-lg">
            As a skilled full-stack developer, I am dedicated to turning ideas
            into innovative web applications. Explore my latest projects and
            articles, showcasing my expertise in React.js and web development.
          </p>

          <div className="space-x-4">
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-secondary font-semibold rounded-md py-2 px-3 inline-flex items-center hover:text-gray-300 transition"
            >
              Resume
              <span className="ml-1">
                <FaArrowUpRightFromSquare className="text-xs" />
              </span>
            </a>

            <a
              href="mailto:mobolajiola22@gmail.com"
              className="underline hover:text-gray-400 transition"
            >
              Contact
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
