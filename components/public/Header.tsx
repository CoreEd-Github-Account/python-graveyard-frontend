import Link from "next/link";

const NAV_LINKS = [
  { label: "Grave List", href: "/graves" },
  { label: "Reservation", href: "/reservation" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between px-6 py-8 sm:px-10">
        <Link href="/" className="font-serif text-3xl leading-none text-gray-900">
          Logo
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-gray-900/90 transition-colors hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}