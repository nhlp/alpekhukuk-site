export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-line bg-navy py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {eyebrow && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65">{description}</p>
        )}
      </div>
    </section>
  );
}
