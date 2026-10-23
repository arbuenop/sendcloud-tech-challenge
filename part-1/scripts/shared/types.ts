export type FieldErrors<FieldName extends string> = Partial<Record<FieldName, string[]>>;

export type SelectOption = {
  label: string;
  value: string;
};

export type ShippingMethod = {
  id: number;
  name: string;
};

export type API = {
  get: (path: string) => Promise<Response>;
  post: (path: string, body: unknown) => Promise<Response>;
};

export type ValidationResult<ValidationSchema> =
  | { ok: true; data: ValidationSchema }
  | { ok: false; errors: FieldErrors<Extract<keyof ValidationSchema, string>> };
