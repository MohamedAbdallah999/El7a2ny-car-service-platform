import type { AddressPayload } from "@car-platform/api-client";
import { Button, Input } from "@car-platform/ui-web";
import { useState } from "react";
import type { FormEvent } from "react";

const emptyForm: AddressPayload = {
  label: "",
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "Egypt",
  postalCode: "",
  isDefault: false,
};

export function AddressForm({
  initialValue,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialValue?: Partial<AddressPayload>;
  onSubmit: (payload: AddressPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}) {
  const [form, setForm] = useState<AddressPayload>({
    ...emptyForm,
    ...initialValue,
  });

  function update<K extends keyof AddressPayload>(key: K, value: AddressPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <Input
        label="Label (optional)"
        placeholder="Home, Work…"
        value={form.label ?? ""}
        onChange={(event) => update("label", event.target.value)}
      />
      <Input
        label="Recipient name"
        required
        value={form.recipientName}
        onChange={(event) => update("recipientName", event.target.value)}
      />
      <Input
        label="Phone"
        required
        value={form.phone}
        onChange={(event) => update("phone", event.target.value)}
      />
      <Input
        label="Address line 1"
        required
        value={form.addressLine1}
        onChange={(event) => update("addressLine1", event.target.value)}
      />
      <Input
        label="Address line 2 (optional)"
        value={form.addressLine2 ?? ""}
        onChange={(event) => update("addressLine2", event.target.value)}
      />
      <Input
        label="City"
        required
        value={form.city}
        onChange={(event) => update("city", event.target.value)}
      />
      <Input
        label="Country"
        required
        value={form.country}
        onChange={(event) => update("country", event.target.value)}
      />
      <label className="inline-actions">
        <input
          type="checkbox"
          checked={Boolean(form.isDefault)}
          onChange={(event) => update("isDefault", event.target.checked)}
        />
        Set as default address
      </label>

      <div className="inline-actions">
        <Button type="submit" loading={isSubmitting}>
          Save address
        </Button>
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
