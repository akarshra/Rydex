"use client";

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
    value: "+91 90000 00000",
  },
  {
    label: "Hours",
    value: "Mon–Sat · 9:00 AM – 7:00 PM IST",
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
          Reach out for support, partnerships, or account help. Share your booking ID (if you have one) so we can resolve your request faster.
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

        <section className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Send a message
            </p>
            <h2 className="mt-3 text-2xl font-bold">We’ll get back quickly.</h2>
            <p className="mt-2 text-sm leading-7 text-white/70">
              For booking issues, include the booking ID and the phone number used during checkout.
            </p>

            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks — your message was recorded (demo UI).");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Full name"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-white/20"
                />
                <input
                  required
                  type="email"
                  placeholder="Email address"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-white/20"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  placeholder="Phone (optional)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-white/20"
                />
                <input
                  placeholder="Booking ID (optional)"
                  className="h-12 rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-white/20"
                />
              </div>
              <textarea
                required
                placeholder="Tell us what you need help with…"
                className="min-h-[130px] w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-white/20"
              />

              <button
                type="submit"
                className="w-full h-12 rounded-xl text-sm font-semibold text-white border border-white/10 bg-white/10 hover:bg-white/15 transition"
              >
                Submit message
              </button>
            </form>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/40">
              Business
            </p>
            <h2 className="mt-3 text-2xl font-bold">Partners & enterprise.</h2>
            <p className="mt-2 text-sm leading-7 text-white/70">
              Want to onboard a fleet, run corporate travel, or integrate RYDEX into an existing platform? We can help with custom SLAs and deployment support.
            </p>

            <div className="mt-6 space-y-4 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-white font-semibold">Partner onboarding</p>
                <p className="mt-1">
                  Email <span className="text-white">partners@rydex.com</span> with your city, vehicle categories, and expected daily capacity.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-white font-semibold">Response times</p>
                <p className="mt-1">
                  Typical response: <span className="text-white">within 24 hours</span> on business days.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="text-white font-semibold">Address</p>
                <p className="mt-1">
                  RYDEX HQ (Demo) · Bengaluru, Karnataka, India
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
