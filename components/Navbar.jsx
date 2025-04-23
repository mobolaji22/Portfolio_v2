"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

import { useOutsideClick } from "@/hooks/use-outside-click";

// Reusable component for Nav items with active state
const NavItem = ({ href, children, isActive }) => (
  <Link href={href}>
    <div
      className={`cursor-pointer hover:underline ${
        isActive ? "underline font-bold" : ""
      }`}>
      {children}
    </div>
  </Link>
);

// Reusable component for social icons
const SocialIcon = ({ Icon, label, href }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-2xl hover-lift cursor-pointer">
    <Icon aria-label={label} />
  </a>
);

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const pathname = usePathname(); // Get the current pathname
  const navRef = useRef(null); // Reference to mobile nav

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle the theme between dark and light modes
  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
    localStorage.setItem("theme", newTheme); // Save theme in localStorage
  };

  // Close the mobile navigation when clicking outside
  useOutsideClick(navRef, () => {
    if (navOpen) setNavOpen(false);
  });

  // Handle mobile navigation toggle
  const handleNav = () => {
    setNavOpen(!navOpen); // Toggle the navOpen state
  };

  // Navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/About", label: "About" },
    { href: "/Projects", label: "Projects" },
    { href: "/Articles", label: "Articles" },
  ];

  // Social links
  const socialLinks = [
    {
      Icon: FaFacebook,
      label: "Facebook",
      href: "https://www.facebook.com/share/18FJge8PUr/",
    },
    {
      Icon: FaTwitter,
      label: "Twitter",
      href: "https://x.com/Ola_mobolaji_?t=khsfSVYX15IZlhzut9FpNw&s=08",
    },
    {
      Icon: FaLinkedin,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/mobolaji-ola-313295317/",
    },
    { Icon: FaGithub, label: "GitHub", href: "https://github.com/mobolaji22" },
  ];

  return (
    <header className="max-w-[1200px] w-full mx-auto mb-7">
      {/* Mobile Nav */}
      <nav className="lg:hidden flex justify-between items-center px-6 py-1">
        <button
          aria-label="Open mobile menu"
          className="text-2xl cursor-pointer"
          onClick={handleNav}>
          <FaBars />
        </button>
        <h1 className="border-2 bg-black text-white font-bold p-3 rounded-full">
          MO
        </h1>
        <a href="mailto:mobolajiola22@gmail.com">
          <div className="flex flex-col items-center text-center cursor-pointer">
            <h1 className="border-2 rounded-full w-12 h-12 text-xs flex justify-center items-center">
              Hire Me
            </h1>
          </div>
        </a>
      </nav>

      {/* Dropdown Mobile Menu with transition */}
      <nav
        ref={navRef}
        className={`lg:hidden flex flex-col items-center justify-center bg-gray-800 bg-opacity-80 dark:bg-black/30 text-white dark:text-gray-300 py-5 space-y-8 text-xl list-none absolute top-[25%] left-[12%] z-50 w-[80%] h-[50dvh] backdrop-blur-lg transition-transform duration-300 ease-in-out ${
          navOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}>
        {navLinks.map(({ href, label }) => (
          <NavItem key={label} href={href} isActive={pathname === href}>
            {label}
          </NavItem>
        ))}
        <div className="flex items-center gap-7">
          {socialLinks.map(({ Icon, label, href }) => (
            <SocialIcon key={label} href={href} Icon={Icon} label={label} />
          ))}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className={`transition duration-300 ease-in-out p-2 rounded-full ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}>
            {isDarkMode ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex justify-between items-center py-3 px-10">
        <div className="text-lg flex items-center gap-5 list-none">
          {navLinks.map(({ href, label }) => (
            <NavItem key={label} href={href} isActive={pathname === href}>
              {label}
            </NavItem>
          ))}
        </div>
        <h2 className="border-2 bg-black text-white font-bold p-3 rounded-full text-2xl w-16 h-16 flex justify-center items-center">
          MO
        </h2>
        <div className="flex items-center gap-7">
          {socialLinks.map(({ Icon, label, href }) => (
            <SocialIcon key={label} href={href} Icon={Icon} label={label} />
          ))}
          <div>
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`transition duration-300 ease-in-out p-2 rounded-full ${
                isDarkMode ? "bg-white text-black" : "bg-gray-800 text-white"
              }`}>
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
