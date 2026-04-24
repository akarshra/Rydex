import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

const CONTACT_POINTS = [
  {
    label: "Support",
    value: "help@rydex.com",
  },
  {
    label: "Partnerships",
    value: "partners@rydex.com",
  },
  {
    label: "Phone",
    value: "+1 (555) 010-2024",
  },
];

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-[#090a0f] text-white">
      <Nav />
      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Talk to the RYDEX team.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
          Reach out for support, partnerships, or account help. We keep the page simple so users can quickly find the right team.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {CONTACT_POINTS.map((point) => (
            <div key={point.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
                {point.label}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {point.value}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
