import Image from "next/image";
import Link from "next/link";

import { Timeline, TimelineEntry, TimelineSide } from "@/components/timeline";

export default function Home() {
  return (
    <div>
      <header>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Hello, world
        </h1>
      </header>
      <section className="grid grid-cols-9">
        <h2 className="text-xl font-semibold tracking-tighter">About</h2>
        <div className="col-span-8">
          <p className="mb-3">
            My name is Joshua Klein. I am a bioinformatician and a general
            purpose programmer.
          </p>
          <p className="mb-3">
            My PhD work was on mass spectrometry informatics for glycomics and
            glycoproteomics at{" "}
            <Link href="https://www.bumc.bu.edu/cbms/">
              Boston University's Center for Biomedical Mass Spetrometry
            </Link>
            . I have written algorithms for low-level signal processing and
            charge deconvolution, database search + post-processing, feature
            extraction and more.
          </p>
          <p className="mb-3">
            After graduation, I worked in the industry for six years at&nbsp;
            <Link href="https://gritstonebio.com/">Gritstone bio</Link>. In
            addition to improving immunopeptide identification rates, I was
            involved in NGS projects for variant calling, gene fusion
            annotation, and proteogenomics. I made deep learning models for
            predicting MHC antigen presentation and immunogenicity for oncology
            and infectious disease. I also developed tools for modeling
            population frequencies of therapeutic targets conditioned on the
            highly polymorphic MHC gene loci.
            {/* disease that were part of multiple clinical studies (NCT05148962,
            NCT05435027, NCT03953235) */}
          </p>
        </div>
      </section>
      <section className="grid grid-cols-9" style={{ display: "none" }}>
        <h2 className="text-xl font-semibold tracking-tighter">Timeline</h2>
        <div className="col-span-8">
          <Timeline props={{}}>
            <TimelineEntry
              side={TimelineSide.Left}
              title={<h2 className="text-lg">2025 - Looking for a new job</h2>}
              content={""}
            />
            <TimelineEntry
              side={TimelineSide.Right}
              title={<h2 className="text-lg">2019 - Gritstone bio</h2>}
              content={""}
            />
            <TimelineEntry
              side={TimelineSide.Left}
              title={<h2 className="text-lg">2018 - Thesis Defense</h2>}
              content={""}
            />
            <TimelineEntry
              side={TimelineSide.Right}
              title={<h2 className="text-lg">2013 - Graduate School</h2>}
              content={""}
            />
          </Timeline>
        </div>
      </section>
    </div>
  );
}
