```
part-1/scripts/
├── index.ts                # composition root: wires ui, api and schemas together
│
├── ui/                     # DOM, events, focus, aria, rendering
│ ├── form.ts               # submit flow: loading, errors, success, focus
│ ├── form.test.ts
│ ├── customs.ts            # hidden + disabled toggle for the customs fieldset
│ └── select-options.ts     # populate selects from the schema
│
├── api/
│ ├── client.ts             # fetch wrapper (can be replaced by axios if needed)
│ ├── shipments.ts          # endpoint definitions
│ └── shipments.test.ts
│
├── schemas/                # where we define all the validation requirements
│ ├── shipment.ts           # Base and Customs schemas, Shipment type, validate()
│ ├── shipment.test.ts
│ └── validation.ts         # ValidationResult, FieldErrors
│
├── shared/                 # pure, re-usable functions, imports nothing from other layers
│ ├── errors.ts             # render/clear field errors, aria-invalid, aria-describedby
│ └── dom.ts                # getRequiredElement() and other DOM helpers
│
└── types/                  # optional: only non-schema types
```
