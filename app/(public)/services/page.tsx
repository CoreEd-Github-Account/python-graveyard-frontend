import Image from "next/image";

interface Service {
  title: string;
  description: string;
}

const SERVICES: Service[] = [
  {
    title: "Grave Booking",
    description:
      "Lorem ipsum dolor sit amet consectetur. Id suscipit odio egestas erat porttitor pulvinar justo dictumst. Cras sagitta nulla massa cras purus aliquet proin.",
  },
  {
    title: "Maintenance",
    description:
      "Lorem ipsum dolor sit amet consectetur. Id suscipit odio egestas erat porttitor pulvinar justo dictumst. Cras sagitta nulla massa cras purus aliquet proin.",
  },
  {
    title: "Flowers Decoration",
    description:
      "Lorem ipsum dolor sit amet consectetur. Id suscipit odio egestas erat porttitor pulvinar justo dictumst. Cras sagitta nulla massa cras purus aliquet proin.",
  },
  {
    title: "Marble Work",
    description:
      "Lorem ipsum dolor sit amet consectetur. Id suscipit odio egestas erat porttitor pulvinar justo dictumst. Cras sagitta nulla massa cras purus aliquet proin.",
  },
];

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-[1360px] px-6 py-12 sm:px-10">
      <h1 className="font-serif text-6xl text-gray-900 mb-8">Services</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {SERVICES.map((service) => (
          <div key={service.title} className="flex gap-6 rounded-2xl bg-neutral-50 p-6">
            <div className="relative h-[264px] w-[264px] shrink-0 overflow-hidden rounded-xl">
              <Image
                src="/service-image.png"
                alt={service.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-1 flex-col">
              <h2 className="font-serif text-2xl text-gray-900 mb-3">{service.title}</h2>
              <p className="flex-1 text-[15px] leading-relaxed text-gray-500">
                {service.description}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex w-fit items-center rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Inquire Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}