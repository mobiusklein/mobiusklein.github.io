import fs from "fs";
import path from "path";

// type Metadata = {
//   title: string;
//   publishedAt: string;
//   summary: string;
//   image?: string;
// };

// function parseFrontmatter(fileContent: string) {
//   let frontmatterRegex = /---\s*([\s\S]*?)\s*---/;
//   let match = frontmatterRegex.exec(fileContent);
//   let frontMatterBlock = match![1];
//   let content = fileContent.replace(frontmatterRegex, "").trim();
//   let frontMatterLines = frontMatterBlock.trim().split("\n");
//   let metadata: Partial<Metadata> = {};

//   frontMatterLines.forEach((line) => {
//     let [key, ...valueArr] = line.split(": ");
//     let value = valueArr.join(": ").trim();
//     value = value.replace(/^['"](.*)['"]$/, "$1"); // Remove quotes
//     metadata[key.trim() as keyof Metadata] = value;
//   });

//   return { metadata: metadata as Metadata, content };
// }

// function getMDXFiles(dir: string) {
//   return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx");
// }

// function readMDXFile(filePath: string) {
//   let rawContent = fs.readFileSync(filePath, "utf-8");
//   return parseFrontmatter(rawContent);
// }

// function getMDXData(dir: string) {
//   let mdxFiles = getMDXFiles(dir);
//   return mdxFiles.map((file) => {
//     let { metadata, content } = readMDXFile(path.join(dir, file));
//     let slug = path.basename(file, path.extname(file));

//     return {
//       metadata,
//       slug,
//       content,
//     };
//   });
// }

export type BibTeXInfo = {
  ENTRYTYPE: string;
  ID: string;
  abstract: string;
  author: string;
  doi: string;
  journal: string;
  year: string;
  url: string[];
  title: string;
  pmid: string;
};

export function collateBibTeX(publications: BibTeXInfo[]) {
  const byYear = new Map<string, BibTeXInfo[]>();

  for (const pub of publications) {
    if (!byYear.has(pub.year)) byYear.set(pub.year, []);
    byYear.get(pub.year)?.push(pub);
  }
  const byYearList = Array.from(
    byYear.entries().map(([year, entries]) => {
      return [parseInt(year), entries];
    })
  );
  byYearList.sort((a, b) => {
    const aYear = a[0];
    const bYear = b[0];
    return aYear > bYear ? -1 : 1;
  });
  return byYearList;
}

export function getBibTeXInfo(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawContent) as BibTeXInfo[];
}

export function getFirstAuthorBibTeX() {
  return getBibTeXInfo(
    path.join(process.cwd(), "src", "app", "publications", "first_author.json")
  );
}

export function getNotFirstauthorBibTeX() {
  return getBibTeXInfo(
    path.join(process.cwd(), "src", "app", "publications", "not_first_author.json")
  );
}

// export function getPublications() {
//   return getMDXData(
//     path.join(process.cwd(), "src", "app", "publications", "publications")
//   );
// }

export function formatDate(date: string, includeRelative = false) {
  const currentDate = new Date();
  if (!date.includes("T")) {
    date = `${date}T00:00:00`;
  }
  const targetDate = new Date(date);

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear();
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth();
  const daysAgo = currentDate.getDate() - targetDate.getDate();

  let formattedDate = "";

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}y ago`;
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}mo ago`;
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}d ago`;
  } else {
    formattedDate = "Today";
  }

  const fullDate = targetDate.toLocaleString("en-us", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (!includeRelative) {
    return fullDate;
  }

  return `${fullDate} (${formattedDate})`;
}

export enum SWProjectMode {
  Maintenance = "maintenance",
  Active = "active",
}

export enum SWProjectType {
  Library = "library",
  Executable = "executable",
  Demo = "demo"
}

export type SWProject = {
  name: string;
  repository: string;
  mode: SWProjectMode;
  type: SWProjectType[];
  tags: string[];
  comment: string;
  language: string[];
};


export function getSWProjectsFor(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(rawContent) as SWProject[];
}


export function getSWProjects() {
  return getSWProjectsFor(
    path.join(process.cwd(), "src", "app", "projects", "projects.json")
  );
}