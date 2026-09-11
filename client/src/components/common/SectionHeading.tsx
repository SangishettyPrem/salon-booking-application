interface SectionHeadingProps {
  title: string;
  description: string;
}

const SectionHeading = ({ title, description }: SectionHeadingProps) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--ink)">
        {title}
      </h1>
      <p className="text-sm text-(--muted) mt-1">{description}</p>
    </div>
  </div>
);

export default SectionHeading;
