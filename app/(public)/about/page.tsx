interface MissionValue {
  title: string;
  description: string;
}

const MISSION_VALUES: MissionValue[] = [
  { title: "Respect", description: "Lorem ipsum dolor sit amet consectetur. Cras nec lectus" },
  { title: "Integrity", description: "Lorem ipsum dolor sit amet consectetur. Cras nec lectus" },
  { title: "Compassion", description: "Lorem ipsum dolor sit amet consectetur. Cras nec lectus" },
  { title: "Faith", description: "Lorem ipsum dolor sit amet consectetur. Cras nec lectus" },
];

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[1360px] px-6 py-12 sm:px-10">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
        <div>
          <h1 className="font-serif text-6xl text-gray-900 mb-6">About Us</h1>

          <h2 className="font-serif text-3xl text-gray-900 mb-4">
            The Brethren of Pakistan&apos;s Founder
          </h2>

          <div className="space-y-4 text-[15px] leading-relaxed text-gray-500">
            <p>
              Lorem ipsum dolor sit amet consectetur. Et lacinia ut diam risus sed. Venenatis
              dictum vitae malesuada nam consectetur. Netus rhoncus risus eu ultrices amet
              euismod ultricies libero morbi. Tincidunt egestas a ultrices in scelerisque sit et
              massa. Sagittis id venenatis id et sed enim nunc suspendisse tempus. Consectetur
              potenti nisl at convallis tincidunt dolor sed ultrices faucibus. Tristique amet
              massa proin orci tempor dignissim. Tellus quam ac luctus eleifend vestibulum
              aliquam nisl faucibus.
            </p>
            <p>
              Tempus a odio phasellus nulla in maecenas felis scelerisque praesent. Augue rhoncus
              senectus placerat vel nisl nisl sed sed et. Dolor felis vulputate justo mi diam
              tempus fringilla. Feugiat at vitae lacinia arcu lacus proin suspendisse odio eget.
              Tortor mauris et praesent sed scelerisque sapien tincidunt proin ac. Nec diam
              eleifend ullamcorper et amet. Quis cras purus eu sed volutpat arcu senectus
              blandit. Nunc diam malesuada faucibus varius. Eu elit amet vel sed congue. Phasellus
              senectus nibh placerat cursus congue vehicula aenean. Pulvinar faucibus lorem diam
              hendrerit bibendum imperdiet viverra. Eleifend vitae cras nec eu integer
              pellentesque sed egestas. Phasellus eu orci pulvinar blandit mattis et.
            </p>
          </div>
        </div>

        <div className="flex aspect-[4/4.4] items-center justify-center rounded-2xl bg-neutral-200 lg:aspect-auto lg:h-full lg:min-h-[456px]">
          <span className="text-center text-2xl text-neutral-500">
            Community
            <br />
            Photo
          </span>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-3xl text-gray-900 mb-6">Our Mission &amp; Values</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MISSION_VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl bg-neutral-50 p-8 text-center">
              <h3 className="font-serif text-2xl text-gray-900 mb-3">{value.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{value.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}