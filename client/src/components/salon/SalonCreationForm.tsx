import { useState } from "react";
import { useFormik } from "formik";
import { Store } from "lucide-react";
import { SalonCreationValidationSchema } from "@/validations/salon.validation";
import type { SalonCreationState } from "@/redux/features/salon/salon.types";
import SectionHeading from "@/components/common/SectionHeading";
import TextField from "@/components/common/TextField";
import { handleError, handleSuccess } from "@/utils/handleResponse";
import { useAppDispatch } from "@/redux/hooks/redux.hooks";
import { createSalon } from "@/redux/features/salon/salon.slice";

const initialValues: SalonCreationState = {
  name: "",
  phone: "",
  email: "",
  description: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",
};

const SalonCreationForm = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema: SalonCreationValidationSchema,
    validateOnBlur: false,
    validateOnChange: isSubmitted,
    onSubmit: async (): Promise<string | void> => await handleSubmit(),
  });

  const handleSalonCreationFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(formik.values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {},
        ),
      );
      return handleError("Please enter all the required fields");
    }
    await formik.submitForm();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitted(true);
      const result = await dispatch(createSalon(formik.values)).unwrap();
      if (!result.success) {
        return handleError(
          result?.message || "Failed to create salon. Try again later",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return handleSuccess("Salon Created Successfully");
    } catch (error: any) {
      return handleError(error ?? "Failed to create salon. Try again later");
    } finally {
      setIsSubmitted(false);
    }
  };

  return (
    <section className="container p-5">
      <div className="mb-8 max-w-2xl">
        <span className="eyebrow">partner portal</span>
        <h1 className="mt-2">Create a new salon</h1>
        <p className="text-(--muted)">
          Build a welcoming profile for your salon and pin its exact location
          for customers.
        </p>
      </div>
      <form
        onSubmit={handleSalonCreationFormSubmit}
        noValidate
        className="grid gap-5"
      >
        <section className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-(--shadow) sm:p-7">
          <SectionHeading
            title="Basic information"
            description="Tell customers what makes your salon worth visiting."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="name"
              label="Salon name"
              placeholder="Enter salon name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.name}
              touched={isSubmitted}
              required
            />
            <TextField
              name="phone"
              label="Phone number"
              type="tel"
              inputMode="tel"
              maxLength={10}
              placeholder="Enter 10-digit phone number"
              value={formik.values.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                formik.setFieldValue("phone", value);
              }}
              onBlur={formik.handleBlur}
              error={formik.errors.phone}
              touched={isSubmitted}
              required
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter salon email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.email}
              touched={isSubmitted}
              required
            />
            <div className="md:col-span-2">
              <TextField
                name="description"
                label="Description"
                multiline
                placeholder="Tell customers about your salon..."
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.errors.description}
                touched={isSubmitted}
              />
            </div>
          </div>
        </section>
        <section className="rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-(--shadow) sm:p-7">
          <SectionHeading
            title="Salon address"
            description="Add the address customers will see on your salon profile."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              name="addressLine1"
              label="Address line 1"
              placeholder="Street address and building name"
              value={formik.values.addressLine1}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.addressLine1}
              touched={isSubmitted}
              required
            />
            <TextField
              name="addressLine2"
              label="Address line 2"
              placeholder="Suite, floor or landmark"
              value={formik.values.addressLine2}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.addressLine2}
              touched={isSubmitted}
            />
            <TextField
              name="city"
              label="City"
              placeholder="Enter city"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.city}
              touched={isSubmitted}
              required
            />
            <TextField
              name="state"
              label="State"
              placeholder="Enter state"
              value={formik.values.state}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.state}
              touched={isSubmitted}
              required
            />
            <TextField
              name="country"
              label="Country"
              placeholder="Enter country"
              value={formik.values.country}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.country}
              touched={isSubmitted}
              required
              readOnly
            />
            <TextField
              name="postalCode"
              label="Postal code"
              placeholder="Enter postal code"
              value={formik.values.postalCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.errors.postalCode}
              touched={isSubmitted}
              required
            />
          </div>
        </section>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              formik.resetForm();
            }}
            disabled={isSubmitted}
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-(--line) bg-(--surface) px-6 text-sm font-bold text-(--ink) transition hover:bg-(--soft)"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="button min-h-12 px-6"
            disabled={isSubmitted}
          >
            <Store className="size-4" />
            Create salon
          </button>
        </div>
      </form>
    </section>
  );
};

export default SalonCreationForm;
