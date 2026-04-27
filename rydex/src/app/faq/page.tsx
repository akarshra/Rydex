import Footer from "@/components/Footer";
import Nav from "@/components/Nav";

const FAQ_ITEMS = [
  {
    question: "How do I book a vehicle?",
    answer:
      "Open Book, set pickup + drop, choose a category, and confirm. You’ll see an ETA and fare estimate before you request. Once a partner accepts, you can proceed to payment and track the ride.",
  },
  {
    question: "Can I book different vehicle types?",
    answer:
      "Yes. RYDEX supports bikes, cars, SUVs, vans, and trucks. Availability depends on your location, time, and which partners are online.",
  },
  {
    question: "How does payment work?",
    answer:
      "You can pay by cash (and if enabled in your deployment, online payments). RYDEX shows your payable amount during checkout and marks the booking as confirmed once the payment step is completed.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes. You can cancel from the booking/checkout flow while you’re waiting for acceptance. If a driver is already assigned, cancellation rules may apply based on your deployment policy.",
  },
  {
    question: "Do owners get live ride updates?",
    answer:
      "Yes. Partners get real-time booking status updates. Riders can also view live status and ride progress on the ride screen.",
  },
  {
    question: "What if a driver doesn’t accept?",
    answer:
      "If no one accepts within the time window, the request may expire. You can retry with a different category, nearby pickup point, or adjusted time.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We use authenticated sessions and role-based access for admin/vendor features. Always run with strong secrets in production and restrict admin accounts to trusted users only.",
  },
  {
    question: "How do partner approvals work?",
    answer:
      "Partners submit onboarding details and vehicle information. Admins review vendor verification and vehicle pricing/media before approving access to accept rides.",
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
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
          Quick answers for riders and partners. If you still need help, use the contact page and we’ll route you to the right team.
        </p>
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

        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Rider tips
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>- Use a precise pickup pin for faster acceptance.</li>
              <li>- Keep your phone reachable for driver confirmation.</li>
              <li>- Check vehicle category rules (bags, passengers, cargo).</li>
            </ul>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Partner tips
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>- Complete KYC and document upload to get approved faster.</li>
              <li>- Keep pricing updated to avoid review delays.</li>
              <li>- Respond quickly to requests to improve acceptance rate.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
