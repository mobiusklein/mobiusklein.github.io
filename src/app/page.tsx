import Link from "next/link";

export default function Home() {
  return (
    <div className="mb-8">
      <header>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Hello, world
        </h1>
      </header>
      <section className="grid grid-cols-5 md:grid-cols-9">
        <h2 className="text-xl font-semibold tracking-tighter col-span-1 md:col-span-1">
          About
        </h2>
        <div className="col-span-4 md:col-span-7">
          <p className="mb-3 text-left mt-1">
            My name is Joshua Klein. I am a bioinformatician and a general
            purpose programmer.
          </p>
        </div>
      </section>
      <section className="grid grid-cols-9">
        <p className="mb-3 col-span-9">
          My PhD work was on mass spectrometry informatics for glycomics and
          glycoproteomics at{" "}
          <Link href="https://www.bumc.bu.edu/cbms/">
            Boston University&apos;s Center for Biomedical Mass Spetrometry
          </Link>
          . I have written algorithms for low-level signal processing and charge
          deconvolution, database search + post-processing, feature extraction
          and more.
        </p>
        <p className="mb-3 col-span-9">
          After graduation, I worked in the industry for six years at&nbsp;
          <Link href="https://gritstonebio.com/">Gritstone bio</Link>. In
          addition to improving immunopeptide identification rates, I was
          involved in NGS projects for variant calling, target discovery, gene
          fusion annotation, and proteogenomics. I made deep learning models for
          predicting MHC antigen presentation and immunogenicity for oncology
          and infectious disease. I also developed tools for designing
          multi-antigen mosaic vaccines and for modeling population coverage of
          therapeutic targets conditioned on the highly polymorphic MHC gene
          loci and disease-specific target prevalences for the designed
          vaccines.
          {/* disease that were part of multiple clinical studies (NCT05148962,
            NCT05435027, NCT03953235) */}
        </p>
        <p className="mb-3 col-span-9">
          For more details, please see my{" "}
          <Link href="doc/CV_JoshuaKlein_2024.pdf">CV</Link>.
        </p>
      </section>
    </div>
  );
}
