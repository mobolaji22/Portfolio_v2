import { FaHeart } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t-2 max-w-[1200px] w-full mx-auto mt-7 flex-col md:flex-row items-center md:justify-between py-3 px-10">
      <p className="text-center md:text-left">{`2024-${new Date().getFullYear()} © All Rights Reserved.`}</p>
      <p className="flex items-center justify-center md:justify-end gap-2 md:-mt-6">
        Built with <FaHeart className="text-red-500" /> by
        <a href="mailto:mobolajiola22@gmail.com">
          <span className="underline">Mobolaji</span>
        </a>
      </p>
    </footer>
  );
};

export default Footer;
