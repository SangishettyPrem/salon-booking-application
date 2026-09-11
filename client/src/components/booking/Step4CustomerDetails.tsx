import React from "react";
import { MoveLeft } from "lucide-react";
import TextField from "@/components/common/TextField";

interface Step4CustomerDetailsProps {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  onChangeName: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onBack: () => void;
}

export const Step4CustomerDetails: React.FC<Step4CustomerDetailsProps> = ({
  customerName,
  customerPhone,
  customerEmail,
  onChangeName,
  onChangePhone,
  onChangeEmail,
  onBack,
}) => {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-(--surface) border border-(--line) shadow-xs space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1 border-b border-(--line) pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 rounded-lg hover:bg-(--soft) text-(--ink) transition-colors cursor-pointer"
          >
            <MoveLeft size={19} />
          </button>
          <h2 className="text-lg font-bold text-(--ink)">
            Step 4: Guest Information
          </h2>
        </div>
        <p className="text-xs text-(--muted) pl-7">
          Your booking confirmation and SMS updates will be sent here.
        </p>
      </div>

      <div className="space-y-4">
        <TextField
          name="name"
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={customerName}
          onChange={(e) => onChangeName(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            name="phone"
            label="Phone Number (10 digits)"
            type="tel"
            maxLength={10}
            placeholder="e.g. 9876543210"
            value={customerPhone}
            onChange={(e) => onChangePhone(e.target.value.replace(/\D/g, ""))}
            required
          />
          <TextField
            name="email"
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            value={customerEmail}
            onChange={(e) => onChangeEmail(e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};
