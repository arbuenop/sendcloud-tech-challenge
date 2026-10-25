## Folder structure

@note. With this approach, the form would be validated only when submitted, not after unfocusing a field.

```
part-1/
├── new-shipment.html
├── README.md
├── favicon.svg
├── styles/
│   ├── main.css            # only @imports, in order
│   ├── variables.css       # design tokens from Figma
│   ├── base.css            # reset, typography, layout primitives
│   └── form.css            # fieldsets, labels, inputs, buttons, error/status states
└── scripts/
    ├── index.ts            # composition root
    ├── api.ts              # get/post, base URL, timeout
    ├── api.test.ts
    ├── schema.ts           # valibot schemas, Shipment type, validateField(), validateAll()
    ├── schema.test.ts
    ├── controller.ts       # orchestration: validate, post, tell the view
    ├── controller.test.ts
    ├── view.ts             # connection between the html document and the controller.
    └── utils.ts            # getRequiredElement() and similar helpers

```
