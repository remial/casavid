import { CMS_NAME } from "@/lib/constants";

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between my-2 md:mb-12">
      <h1 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight md:pr-8">
        RefinePic Blog 🏡
      </h1>
      <h4 className="text-center md:text-left text-lg mt-5 md:pl-8">
        The very latest in AI Interior Design for Buildings, Rooms and Home Exterior ✨
      </h4>
    </section>
  );
}