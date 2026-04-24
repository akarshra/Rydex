import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

const FAQ_ITEMS = [
  {
    question: "How do I book a vehicle?",
    answer: "Open the booking flow, choose your pickup and drop, then pick a vehicle that fits your trip.",
  },
  {
    question: "Can I book different vehicle types?",
    answer: "Yes. RYDEX supports bikes, cars, SUVs, vans, and trucks.",
  },
  {
    question: "How does payment work?",
    answer: "You can pay online or choose cash depending on the trip and vehicle settings.",
  },
  {
    question: "Do owners get live ride updates?",
    answer: "Yes. The platform includes live tracking and booking status updates for partners.",
  },
];

export default function FaqPage() {
  return (
    <div className="w-full min-h-screen bg-[#090a0f] text-white">
      <Nav />
      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
          FAQ
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Frequently asked questions.
        </h1>
        <div className="mt-10 space-y-4">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <summary className="cursor-pointer list-none text-lg font-semibold text-white">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-7 text-white/70 sm:text-base">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
