import Footer from "@/components/Footer";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const Articles = () => {
  return (
    <>
      <Navbar />
      <h1 className="text-2xl md:text-5xl font-bold max-w-[1200px] mx-auto my-5 text-center px-10">
        Words Can Change The World!
      </h1>
      <main className="relative bg-black-100 max-w-[1200px] mx-auto sm:px-16 px-8 py-5 grid grid-cols-4">
        {/* Card */}
        <div className=" flex flex-col col-span-4 lg:flex-row justify-center items-center gap-3 lg:gap-5 p-8 border-border border-2 rounded-3xl shadow-[8px_8px_15px_rgba(255,255,255,0.5)]">
          <Image
            src="/images/articles/pagination component in reactjs.jpg"
            alt="Profile picture of the developer"
            width={400}
            height={300}
            className="object-cover rounded-2xl"
          />

          <div className="w-full lg:w-1/2 space-y-6">
            <h1 className="font-semibold text-2xl lg:text-3xl tracking-wide">
              Build A Custom Pagination Component In Reactjs From Scratch.
            </h1>

            <p className="my-6 text-gray-300">
              Learn how to build a custom pagination component in Reactjs from
              scratch. Follow this step-by-step guide to integrate your own
              pagination component into your project.
            </p>

            <div className="">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-300 hover:text-red-400 transition"
              >
                9 mins read
              </a>
            </div>
          </div>
        </div>
        {/* Card */}
      </main>
      <Footer />
    </>
  );
};

export default Articles;
