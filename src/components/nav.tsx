import Link from "next/link";
import Image from "next/image";

const navItems = {
  "/": {
    name: "About",
    fragment: null,
  },
  "/projects": {
    name: "Projects",
    fragment: null,
  },
  "/publications": {
    name: "Publications",
    fragment: null,
  },
  "/cv": {
    name: "CV",
    fragment: "doc/CV_JoshuaKlein_2024.pdf",
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20 top-20 md:sticky">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex md:flex-row lg:flex-row space-x-1 pr-10 align-middle py-1 px-2 m-1 font-semibold md:text-xl flex-col">
            <Image
              src="img/signal-3-svgrepo-com.svg"
              width={30}
              height={50}
              alt=""
            />
            <Link href={"/"} className="nav-link">
              Joshua Klein, PhD
            </Link>
          </div>
          <div className="flex md:flex-row flex-col space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name, fragment }]) => {
              return (
                <Link
                  key={path}
                  href={fragment ? fragment : path}
                  className="nav-link topic transition-all hover:text-neutral-800 dark:hover:text-neutral-200 py-1 px-2 m-1"
                >
                  {name}
                </Link>
              );
            })}
            <Link
              href="https://github.com/mobiusklein"
              className=" py-0 px-2 m-1"
            >
              <Image
                src="img/github-svgrepo-com.svg"
                width={30}
                height={30}
                alt="GitHub Profile"
              />
            </Link>
            <Link
              href="https://www.linkedin.com/in/joshua-klein-a6155956/"
              className=" py-0 px-2 m-1"
            >
              <Image
                src="img/linkedin-svgrepo-com.svg"
                width={30}
                height={30}
                alt="LinkedIn Profile"
              />
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
