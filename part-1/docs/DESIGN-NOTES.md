# Figma comments

## PRIO 1 (Must haves)

TBD: All the content could be wrapped in a single container rather than having the sections separated by cards. Both approaches have perks and disadvantages.

**Single card approach:**

- Easier to adapt to mobile devices
- Visual anchoring of the button to the cards above
- Collapsible sections possible but not recommended
- If the form grows and it has a lot of sections we wont be able to highlight only the ones that contain errors

**Card per-section approach:**

- Better separation of concerns
- Easy to add collapsible content
- If there are more sections and there is an error in one, it will be easy to spot if we just change the border color to red
- Adds unnecessary margins for mobile displays
- Button suggests primary action but not necessarily linked to the content above

* In my opinion I would wrap all the sections in a single card, but I would need a bit more context of this specific use case to determine if that is the best choice. I will proceed with the first option but know that normally I would ask my team for more information.

Customs information section will be conditionally rendered based on the country selected.

Optional fields should be marked with an (Optional) flag; required fields should not have a marker.

I understand that this form is to create a shipment, not to send it so the label and the icon of the cta button are wrong.

All the form fields need labels, error states, placeholders, info and dropdown lists.

The solid background of the radio cards’ selected state without outline is too aggressive, it might stand out too much, also I would need to double check if that is a correct combination from an accessibility point of view.
On top of that, the missing classical radio dot can make the radio buttons be mistaken by just text cards.

## PRIO 2 (Nice to have)

Missing pre-fix dropdown. +31, +43 … for the phone field. TBD: Double check the value-effort ratio of having a text mask that forces the correct format of the phone beyond the numeric input and the maximum length

Parenthesis are not needed in the phone number hint

Nonsense option “Reliable”, a shipment can be reliable regardless of the price and the time of delivery. TBD:

- Is this intended?

I would not call the middle radio card 'cheap', it gives the feeling that the quality will be low. I would rather say something like Economic or Affordable

TBD:

- Wouldn't it make more sense to have the following options: Normal/Standard (cheaper but longer delivery times) and Express/Fast (More expensive but faster delivery)

Missing link for terms and conditions;

Update preferably by a combo-box with search function (Not feasible due to the requirement present in the README file that says explicitly "If in doubt, try to keep your solution simple.")

## PRIO 3 (Only if time allows)

Color of the titles should be changed to #112857

Corners and box-shadow not aligned with other forms in the system

Background color not correct according to other forms. Correct color #f5f6fa

Missing fields for post code, street and number (However I just realized they are not present in the api docs so I won't implement them)

Transforming each section into an expander could be a low hanging fruit, It only adds a few lines in the script.[ https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible](< https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible>)

Border radius of the components not align with the rest of the app

Design not consistent with other radio cards in the app
