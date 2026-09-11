import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: string;
  handleRefetch: () => void;
  title: string;
}

const Error = ({ error, handleRefetch, title }: ErrorProps) => {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900">
        Unable to load {title}
      </h2>
      <p className="mt-2 max-w-md text-sm text-gray-500">{error}</p>
      <button
        type="button"
        onClick={handleRefetch}
        className="mt-5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
      >
        Try Again
      </button>
    </div>
  );
};

export default Error;
