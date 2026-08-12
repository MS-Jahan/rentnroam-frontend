import Link from "next/link";
import { Mail, Phone, MapPin, Globe, Code2, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-footer text-footer-text">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand & Blurb */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blaze text-white font-bold text-lg">
                R
              </span>
              Rent<span className="text-blaze">NRoam</span>
            </Link>
            <p className="text-sm text-footer-text/70 leading-relaxed">
              The premier sports & outdoor equipment rental platform. Pick dates, pay securely with Stripe, and conquer the trail.
            </p>
            <div className="flex items-center gap-3 text-footer-text/60">
              <a
                href="https://github.com/MS-Jahan/rentnroam-frontend"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blaze transition"
                aria-label="Frontend repository (GitHub)"
              >
                <Code2 className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/MS-Jahan/rentnroam-api"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blaze transition"
                aria-label="Backend repository (GitHub)"
              >
                <Code2 className="h-5 w-5" />
              </a>
              <a
                href="https://gearup-frontend-kappa.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blaze transition"
                aria-label="Live website"
              >
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Explore Catalog</h4>
            <ul className="space-y-2 text-sm text-footer-text/70">
              <li>
                <Link href="/gear" className="hover:text-blaze transition">
                  Browse All Gear
                </Link>
              </li>
              <li>
                <Link href="/gear?category=camping" className="hover:text-blaze transition">
                  Camping & Outdoors
                </Link>
              </li>
              <li>
                <Link href="/gear?category=cycling" className="hover:text-blaze transition">
                  Mountain Bikes
                </Link>
              </li>
              <li>
                <Link href="/gear?category=water-sports" className="hover:text-blaze transition">
                  Water Sports & Kayaks
                </Link>
              </li>
              <li>
                <Link href="/gear?category=climbing" className="hover:text-blaze transition">
                  Climbing Kits
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Platform */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-sm text-footer-text/70">
              <li>
                <Link href="/about" className="hover:text-blaze transition">
                  About RentNRoam
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-blaze transition">
                  Help & FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blaze transition">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blaze transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-blaze transition">
                  Terms of Rental
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & API */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white">Contact & Developers</h4>
            <ul className="space-y-2.5 text-sm text-footer-text/70">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blaze shrink-0" />
                <span>Dhaka & Chittagong, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blaze shrink-0" />
                <span>support@rentnroam.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blaze shrink-0" />
                <span>+880 1700-000001</span>
              </li>
              <li className="pt-2">
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-footer-text/20 px-3 py-1.5 text-xs font-semibold text-white hover:border-blaze hover:text-blaze transition"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Swagger API Docs</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-footer-text/10 flex flex-col sm:flex-row items-center justify-between text-xs text-footer-text/50 gap-4">
          <p>© {new Date().getFullYear()} RentNRoam Rental Marketplace. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-footer-text/80">Privacy</Link>
            <Link href="/terms" className="hover:text-footer-text/80">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
