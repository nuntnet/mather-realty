"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Mail, MessageCircle, Phone } from "lucide-react";

const LINE_SVG = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const WHATSAPP_SVG = (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const CONTACT_METHODS = [
  {
    icon: LINE_SVG,
    label: "LINE",
    value: "@doublen-realty",
    href: "https://line.me/R/ti/p/@doublen-realty",
    color: "bg-[#00B900]",
    description: "Fastest response — usually within minutes",
  },
  {
    icon: WHATSAPP_SVG,
    label: "WhatsApp",
    value: "+66 86 990 2999",
    href: "https://wa.me/66869902999",
    color: "bg-[#25D366]",
    description: "Available 9 AM – 9 PM Bangkok time",
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: "hello@doublen-realty.com",
    href: "mailto:hello@doublen-realty.com",
    color: "bg-[#1E6B69]",
    description: "We reply within 1 business day",
  },
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Phone",
    value: "+66 86 990 2999",
    href: "tel:+66869902999",
    color: "bg-slate-700",
    description: "Mon–Sat, 9 AM – 6 PM Bangkok time",
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to send message");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="-mt-16 pt-16 bg-gradient-to-br from-[#0F1C1B] via-[#16302E] to-[#0F1C1B] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-serif font-medium text-white mb-3 leading-[1.08]">Get in Touch</h1>
          <p className="text-white/70 text-lg">
            We&apos;d love to hear from you. Reach us via LINE, WhatsApp, email, or the form below.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left: contact methods + map */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Contact Methods</h2>
            <div className="space-y-3">
              {CONTACT_METHODS.map((method) => (
                <a
                  key={method.label}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-shadow group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${method.color} text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    {method.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {method.label}
                    </div>
                    <div className="font-semibold text-gray-900 text-sm">{method.value}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{method.description}</div>
                  </div>
                </a>
              ))}
            </div>

            {/* Bangkok Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <div className="relative bg-slate-200 h-44 flex items-center justify-center">
                <img
                  src="https://maps.googleapis.com/maps/api/staticmap?center=Bangkok,Thailand&zoom=11&size=600x200&maptype=roadmap&style=feature:all|saturation:-20&key=placeholder"
                  alt="Bangkok, Thailand"
                  className="w-full h-full object-cover opacity-70"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#1E6B69] border-4 border-white shadow-lg mb-2" />
                  <span className="text-xs font-semibold text-gray-700 bg-white/80 px-3 py-1 rounded-full shadow">
                    Bangkok, Thailand
                  </span>
                </div>
              </div>
              <div className="bg-white px-4 py-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Bangkok — Head office</span>
                <a
                  href="https://goo.gl/maps/bangkok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1E6B69] hover:underline font-medium"
                >
                  Open in Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-serif font-medium text-green-800 mb-2">Message sent!</h3>
                <p className="text-green-600 mb-6">We&apos;ll get back to you within 1 business day.</p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  variant="outline"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-7 pb-6 border-b border-gray-100">
                  <div className="w-11 h-11 rounded-xl bg-[#1E6B69] flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-serif font-medium text-gray-900">Send us a message</h2>
                    <p className="text-sm text-gray-400">We reply within 1 business day</p>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-5">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-gray-600 text-sm font-medium">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Your full name"
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-600 text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-gray-600 text-sm font-medium">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us how we can help — property type, budget, preferred area, move-in date..."
                      rows={5}
                      className="mt-1.5"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1E6B69] hover:bg-[#18605E] text-white font-bold h-12 rounded-xl"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
