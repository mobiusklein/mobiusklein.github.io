import Link from "next/link";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";

import * as _ from "lodash";

import {
  formatDate,
  getSWProjects,
  SWProject,
  SWProjectMode,
  SWProjectType,
} from "@/utils/posts";

interface ImageProps {
  width?: number;
  height?: number;
  src?: string;
  alt?: string;
}

const BADGE_SIZE = 20;


const BadgeBase = ({ width, height, src, alt }: ImageProps) => {
  if (!src) {
    src = ""
  }
  if (!alt) {
    alt = ""
  }
  if (!width) {
    width = BADGE_SIZE;
  }
  if (!height) {
    height = BADGE_SIZE;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ display: "inline" }}
      className="mx-0.5"
      title={alt}
    />
  );
}

const DemoBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/demo-button.svg"} alt="Demo" {...props} />;
};

const ExeBadge = (props: ImageProps) => {
  return (
    <BadgeBase
      src={"img/file-exe-1731-svgrepo-com.svg"}
      alt="Executable"
      {...props}
    />
  );
};

const LibBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/library-svgrepo-com.svg"} alt="Library" {...props} />;
};

const PythonBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/python-svgrepo-com.svg"} alt="Python" {...props} />;
};

const CBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/c3-svgrepo-com.svg"} alt="C" {...props} />;
};

const TSBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/typescript-official-svgrepo-com.svg"} alt="TypeScript" {...props} />
}

const JSBadge = (props: ImageProps) => {
  return (
    <BadgeBase
      src={"img/js-official-svgrepo-com.svg"}
      alt="JavaScript"
      {...props}
    />
  );
};

const CSharpBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/csharp2-svgrepo-com.svg"} alt="C#" {...props} />;
};

const RustBadge = (props: ImageProps) => {
  return <BadgeBase src={"img/rust-svgrepo-com.svg"} alt="Rust" {...props} />;
};

const Badges = ({ project }: { project: SWProject }) => {
  const badges = [];
  if (project.language.includes("python")) badges.push(<PythonBadge />);
  if (project.language.includes("c")) badges.push(<CBadge />);
  if (project.language.includes("rust")) badges.push(<RustBadge />);
  if (project.language.includes("csharp")) badges.push(<CSharpBadge />);
  if (project.language.includes("typescript")) badges.push(<TSBadge />);
  if (project.language.includes("javascript")) badges.push(<JSBadge />);

  if (project.type.includes(SWProjectType.Executable)) badges.push(<ExeBadge />);
  if (project.type.includes(SWProjectType.Library)) badges.push(<LibBadge />);
  if (project.type.includes(SWProjectType.Demo)) badges.push(<DemoBadge />);

  return <span className="float-end">{...badges}</span>;
};

export default function SWProjects() {
  const swProjects = getSWProjects();
  const byMode = _.groupBy(swProjects, (proj) => proj.mode)
  const maintenanceSWProjects = byMode['maintenance'];
  const activeSWProjects = byMode['active'];
  return (
    <div>
      <section className="text-lg mb-4">
        {`
        My open-source software projects.
        `}
      </section>
      <section className="border-b-violet-800 border-b-2 mb-4">
        <h4 className="text-lg text-neutral-800">Active</h4>
        <p>These are the projects that are in active development.</p>
        <ul>
          {activeSWProjects.map((project) => {
            return (
              <li key={project.name} className="list-disc">
                <Link
                  href={project.repository}
                  className="font-mono"
                  style={{ display: "inline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.name}
                </Link>
                {"  "}
                <Badges project={project} />
                <MDXRemote source={project.comment} />
              </li>
            );
          })}
        </ul>
      </section>
      <section className="border-b-violet-800 border-b-2 mb-4">
        <h4 className="text-lg text-neutral-800">Maintenance</h4>
        <p className="mb-2">
          These projects are functionally complete or no longer being actively
          worked on. Some of them were superceded by other projects to work
          around language limitations or other technical issues.
        </p>
        <ul>
          {maintenanceSWProjects.map((project) => {
            return (
              <li key={project.name} className="list-disc" id={project.name}>
                <Link
                  href={project.repository}
                  className="font-mono"
                  style={{ display: "inline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {project.name}
                </Link>
                {"  "}
                <Badges project={project} />
                <MDXRemote source={project.comment} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
