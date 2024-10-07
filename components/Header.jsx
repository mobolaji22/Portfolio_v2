"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaBars,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false); // State for theme toggle

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Add logic to apply theme changes if necessary
  };

  const handleNav = () => {
    // Add logic to toggle the navigation menu if necessary
  };

  return (
    <header className="max-w-[--max-width] w-full mx-auto mb-7">
      <nav className="md:hidden flex justify-between items-center px-6">
        <FaBars className="text-2xl cursor-pointer" onClick={handleNav} />
        <h1 className="border-2 border-white p-3 rounded-full">MO</h1>
        <div class="flex flex-col items-center justify-center text-center cursor-pointer">
          <p class="text-sm">Web Developer</p>
          <h4 class="border-2 border-white text-center rounded-full w-12 h-12 text-xs flex justify-center items-center">
            Hire Me
          </h4>
          <p class="text-sm">Web Developer</p>
        </div>
      </nav>
      <nav className="hidden md:flex justify-between items-center py-3">
        <ul className="text-lg flex items-center gap-5">
          <Link href="/">
            <li className="cursor-pointer">Home</li>
          </Link>
          <Link href="/About">
            <li className="cursor-pointer">About</li>
          </Link>
          <Link href="/Projects">
            <li className="cursor-pointer">Projects</li>
          </Link>
          <Link href="/Articles">
            <li className="cursor-pointer">Articles</li>
          </Link>
        </ul>
        <h1 className="border-2 border-white p-3 rounded-full text-2xl w-16 h-16 flex justify-center items-center">
          MO
        </h1>
        <ul className="flex items-center gap-7">
          <li className="text-2xl hover-lift cursor-pointer">
            <FaFacebook />
          </li>
          <li className="text-2xl hover-lift cursor-pointer">
            <FaTwitter />
          </li>
          <li className="text-2xl hover-lift cursor-pointer">
            <FaLinkedin />
          </li>
          <li className="text-2xl hover-lift cursor-pointer">
            <FaGithub />
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className={`transition duration-300 ease-in-out ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
              } p-2 rounded-full`}
            >
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
