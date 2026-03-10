import {
  ShoppingCart,
  BarChart3,
  Zap,
  Shield,
  Smartphone,
  Cloud,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Lightning Fast",
    description:
      "Process transactions in seconds with an intuitive interface built for speed.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Real-Time Analytics",
    description:
      "Track sales, inventory, and performance with live dashboards and reports.",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Multi-Device",
    description:
      "Works seamlessly on tablets, phones, and desktops — any screen, anywhere.",
  },
  {
    icon: <Cloud className="h-6 w-6" />,
    title: "Cloud Sync",
    description:
      "All your data is automatically backed up and synced across all your devices.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Payments",
    description:
      "End-to-end encryption and PCI-compliant payment processing you can trust.",
  },
  {
    icon: <ShoppingCart className="h-6 w-6" />,
    title: "Inventory Management",
    description:
      "Automatically update stock levels, get low-stock alerts, and manage suppliers.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "Perfect for small businesses just getting started.",
    features: ["1 register", "Up to 500 products", "Basic reports", "Email support"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mo",
    description: "Everything you need to grow your business.",
    features: [
      "5 registers",
      "Unlimited products",
      "Advanced analytics",
      "Priority support",
      "Inventory alerts",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/mo",
    description: "Custom solutions for large-scale operations.",
    features: [
      "Unlimited registers",
      "Unlimited products",
      "Custom reports",
      "Dedicated support",
      "Multi-location",
      "API access",
    ],
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-[Geist_Variable,sans-serif]">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <ShoppingCart className="h-5 w-5" />
            <span>POSify</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#contact" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button size="sm">Get started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-28 text-center">
        <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground mb-6">
          <Zap className="h-3 w-3" /> Now with AI-powered inventory forecasting
        </span>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          The modern POS system
          <br />
          <span className="text-muted-foreground">built for growth.</span>
        </h1>
        <p className="max-w-xl mx-auto text-muted-foreground text-lg mb-10">
          POSify helps retailers, restaurants, and service businesses sell faster,
          manage smarter, and scale effortlessly — all from one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="gap-2">
            Start free trial <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg">
            Watch demo
          </Button>
        </div>

        {/* Hero mockup */}
        <div className="mt-20 rounded-2xl border border-border bg-muted/40 p-6 shadow-xl">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Revenue today", value: "$4,218.50" },
              { label: "Orders", value: "142" },
              { label: "Avg. order value", value: "$29.71" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-background p-5 text-left"
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border bg-background p-5 text-left">
            <p className="text-sm font-medium mb-3">Recent transactions</p>
            <div className="space-y-2">
              {[
                { item: "Espresso × 2", amount: "$7.00", time: "2 min ago" },
                { item: "Burger Combo", amount: "$14.50", time: "5 min ago" },
                { item: "T-Shirt (M)", amount: "$24.99", time: "11 min ago" },
              ].map((tx) => (
                <div
                  key={tx.item}
                  className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0"
                >
                  <span>{tx.item}</span>
                  <span className="text-muted-foreground text-xs">{tx.time}</span>
                  <span className="font-medium">{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything you need</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From checkout to close-of-day, POSify has every tool your business
              depends on.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-background p-6 hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">No hidden fees. Cancel anytime.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                plan.highlighted
                  ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                  : "border-border bg-background"
              }`}
            >
              <p className="font-semibold text-lg">{plan.name}</p>
              <p
                className={`text-sm mt-1 mb-5 ${
                  plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {plan.description}
              </p>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span
                  className={`text-sm mb-1 ${
                    plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2 text-sm">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlighted ? "secondary" : "default"}
                className="w-full"
              >
                Get started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your sales?</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Join thousands of businesses already using POSify to grow faster.
          </p>
          <Button variant="secondary" size="lg" className="gap-2">
            Start your free 14-day trial <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <ShoppingCart className="h-4 w-4" />
            POSify
          </div>
          <p>© {new Date().getFullYear()} POSify. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
