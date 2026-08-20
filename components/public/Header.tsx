import Link from "next/link";
import Image from "next/image"

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
        
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Surtee Anjuman Islam"
            width={110}
            height={110}
            priority
            className="h-[90px] w-[90px] object-contain sm:h-[110px] sm:w-[110px]"
          />
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