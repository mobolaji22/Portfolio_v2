import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <>
      <Navbar />
      {/* <Header /> */}
      <h1 className="text-3xl md:text-7xl font-bold max-w-[1200px] mx-auto my-10 text-center">
        Passion Fuels Purpose!
      </h1>
      <main className="relative max-w-[1200px] mx-auto px-8">
        <section className="flex flex-col md:flex-row items-center md:gap-10 md:justify-center w-full">
          <div className="flex flex-col md:flex-row-reverse items-center md:justify-between md:gap-16 md:w-[70%]">
            {/* Image Section */}
            <div className="p-8 md:w-1/2 border-secondary border-2 rounded-3xl shadow-[8px_8px_15px_rgba(255,255,255,0.5)]">
              <Image
                src="/images/profile/developer-pic.jpg"
                alt="profile"
                width={400}
                height={300}
                className="object-cover rounded-3xl"
              />
            </div>
            {/* Text Section */}
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold my-5">Biography</h2>
              <p>
                Hi, I&apos;m Mobolaji Ola, a frontend web developer with a
                passion for creating beautiful, functional, and user-centered
                digital experiences. I am always looking for new and innovative
                ways to bring my clients&apos; vision to life.
              </p>
              <p className="mt-5">
                Whether I&apos;m working on a website, mobile app, or other
                digital products, I bring my commitment to building excellence
                and user-centered thinking to every project I work on. I look
                forward to the opportunity to bring my skills and passion to
                your next project.
              </p>
            </div>
          </div>
          {/* Stats Section */}
          <div className="md:w-[20%] flex flex-row md:flex-col justify-center items-center mt-6 md:mt-0 space-x-10 md:space-x-0 md:space-y-10">
            <span className="text-center md:text-right">
              <h3 className="text-4xl md:text-6xl font-bold">3+</h3>
              <br />
              <p className="-mt-5">Satisfied Customers</p>
            </span>
            <span className="text-center md:text-right">
              <h3 className="text-4xl md:text-6xl font-bold">10+</h3>
              <br />
              <p className="-mt-5">Projects Completed</p>
            </span>
            <span className="text-center md:text-right">
              <h3 className="text-4xl md:text-6xl font-bold">1+</h3>
              <br />
              <p className="-mt-5">Years Of Experience</p>
            </span>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default About;
