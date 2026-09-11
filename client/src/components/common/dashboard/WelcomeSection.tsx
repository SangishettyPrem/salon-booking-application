import { useAppSelector } from "@/redux/hooks/redux.hooks";

const WelcomeSection = () => {
  const { user } = useAppSelector((state) => state.auth);
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--ink)">
          {getGreeting()}, {user?.name ?? "User"} 👋
        </h1>
        <p className="text-sm text-(--muted) mt-1">
          Here’s a quick overview of your salon today.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;
