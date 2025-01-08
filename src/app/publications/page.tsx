import { Publications } from '../../components/publications';

export const metadata = {
  title: "Publications",
  description: "Scientific research I've published",
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        My Publications
      </h1>
      <Publications />
    </section>
  );
}
