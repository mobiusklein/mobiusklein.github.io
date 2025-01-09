import Link from "next/link";
import { BibTeXInfo } from '../utils/posts';

import {
  getNotFirstauthorBibTeX,
  getFirstAuthorBibTeX,
  collateBibTeX,
} from "@/utils/posts";


const authorPosition = (authorList: string) => {
  return authorList
    .split(" and ")
    .map((x) => x.replaceAll(".", ""))
    .findIndex((x) => x.includes("Klein"));
}

const markSelfInAuthorList = (entry: BibTeXInfo) => {
  const authorTokens = entry.author.split(" and ");

  const authors = authorTokens
    .map((author) => {
      return author.includes("Klein") ? (
        <b key={entry.ID + author} style={{display: "contents"}}>
          {author}
        </b>
      ) : (
        <>{author}</>
      );
    }).reduce((state: React.ReactElement[], author, idx) => {
      if (idx != 0) {
        state.push(<>{", "}</>)
      }
      state.push(author)
      return state
    }, []);

    return authors
}

export function Publications() {
  const allFirstAuthorPubs = getFirstAuthorBibTeX();
  const allNotFirstAuthorPubs = getNotFirstauthorBibTeX()

  const seenIds = new Set();
  for(const pub of allFirstAuthorPubs) {
    if(seenIds.has(pub.ID)) {
      console.log(`Already had entry for ${pub.ID}`)
    }
    seenIds.add(pub.ID)
  }
  for (const pub of allNotFirstAuthorPubs) {
    if (seenIds.has(pub.ID)) {
      console.log(`Already had entry for ${pub.ID}`);
    }
    seenIds.add(pub.ID);
  }

  const collatedPubs = collateBibTeX(allFirstAuthorPubs.concat(allNotFirstAuthorPubs))

  collatedPubs.forEach((target) => {
    const pubs = target[1] as BibTeXInfo[];
    pubs.sort((a, b) => {
      const aIsFirst = authorPosition(a.author) == 0
      const bIsFirst = authorPosition(b.author) == 0;

      if ((aIsFirst && bIsFirst) || (!aIsFirst && !bIsFirst)) {
        return a.ID.localeCompare(b.ID)
      } else if (!aIsFirst && bIsFirst) {
        return 1
      } else {
        return -1
      }
    })
  })


  return (
    <div>
      <section className="text-lg">
        <p>
          A collection of scholarly research and other peer-reviewed work I have
          written or contributed to. I was a graduate student at Boston
          University from 2014 to 2019, working under the supervision of Joseph
          Zaia and Luis Carvalho.
        </p>
        <p>
          From 2019 to 2025, I was employed by Gritstone bio, but continued to
          develop my dissertation work throughout that period on my own time.
        </p>
      </section>

      <br />

      {collatedPubs.map((params) => {
        const year = params[0] as number;
        const pubs = params[1] as BibTeXInfo[];
        return (
          <div key={year} className="mb-6 border-b-4 border-b-violet-600">
            <h3 className="text-neutral-600 dark:text-neutral-400 tabular-nums md:text-xl text-base">
              {year}
            </h3>
            <ul>
              {pubs.map((pub) => {

                const key = `${pub.ID}_${pub.journal.replaceAll(" ", "_")}_${pub.doi}_${year}_outer`
                return (
                  <li key={key} className="mb-2 list-paper text-base ml-6">
                    <span
                      className="flex flex-col space-y-1 mb-4"
                      style={{ display: "contents" }}
                    >
                      <span className="flex flex-col md:flex-row space-x-0 md:space-x-2 md:text-lg">
                        {markSelfInAuthorList(pub)}
                        {". "}
                        <i
                          style={{ display: "contents" }}
                          className="font-serif"
                        >
                          {pub.title}
                        </i>
                        {", "}
                        {pub.journal}
                      </span>
                    </span>
                    {pub.url ? (
                      <Link href={pub.url[0]} className="break-words">Published at {pub.url[0]}</Link>
                    ) : (
                      ""
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
