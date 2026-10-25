## Folder structure

```
part-1/
├── new-shipment.html
├── README.md
├── favicon.svg
├── styles/
│    ├── main.css          # only @imports, in order
│    ├── variables.css     # design tokens
│    ├── base.css          # reset, element defaults, page layout
│    ├── fonts.css         # font faces
│    ├── field.css         # label, input, select, textarea, checkbox/radio, hint, error text
│    ├── button.css        # submit button and its states (hover, focus, disabled, loading)
│    ├── feedback.css      # success and error messages, shipping-methods loading/error
└── scripts/
    ├── index.ts            # composition root
    ├── api/
    │   ├── client.ts       # get/post, base URL, timeout
    │   └── client.test.ts
    ├── shared/
    │   ├── constants.ts    # countries, export reasons, shipping preferences, CUSTOMS_COUNTRIES, requiresCustoms()
    │   └── types.ts        # cross-cutting types only
    └── features/
        └── new-shipment/
            ├── index.ts        # initNewShipment(): the feature's public entry
            ├── schema.ts       # definitions per-field for form validation
            ├── schema.test.ts
            ├── api.ts          # postShipment(), getShippingMethods()
            ├── api.test.ts
            ├── controller.ts   # orchestration: validate, post, tell the view
            ├── controller.test.ts
            └── view/
                ├── view.ts           # the controller-facing API of the view
                ├── errors.ts         # aria-invalid, aria-describedby, error text
                ├── customs.ts        # hidden + disabled toggle
                ├── shipping-methods.ts # loading, error, retry, options rendering
                ├── select-options.ts # populate country and export reason selects
                └── dom.ts            # getRequiredElement() and similar helpers
```
