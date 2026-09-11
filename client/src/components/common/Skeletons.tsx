const Skeletons = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-80 rounded-3xl bg-(--soft) animate-pulse border border-(--line)"
        />
      ))}
    </div>
  );
};

export default Skeletons;
