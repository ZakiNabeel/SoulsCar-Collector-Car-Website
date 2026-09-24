# Managing parts on SoulCars

Parts use the **same Google spreadsheet, Cloudinary account and Resend setup as cars**. No new database or credentials are needed. The website reads inventory; enquiries are emailed to SoulCars, not added to the spreadsheet.

## 1. Add the Parts tab

In the spreadsheet identified by `GOOGLE_SHEETS_SHEET_ID`, create a tab named exactly `Parts`. Put these headers in row 1, in this order:

| Column | Header        | What to enter                                                                                                                                 |
| ------ | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A      | slug          | A unique, permanent identifier, such as `mercedes-w123-headlight-left`                                                                        |
| B      | name          | Required. Rows without a name are ignored.                                                                                                    |
| C      | fits          | Compatible makes, models, years or part numbers                                                                                               |
| D      | condition     | `New`, `Used` or `Restored`; blank defaults to Used                                                                                           |
| E      | price         | PKR amount, e.g. `45000`, `50k` is **not supported**; use `50,000`. `1.5 Lac` and `Price on request` also work. Blank shows Price on request. |
| F      | image         | Optional public image URL, used if no Cloudinary folder images are found                                                                      |
| G      | images_folder | Cloudinary subfolder, e.g. `Parts/W123-headlight-left`                                                                                        |
| H      | description   | Optional details, included components, defects and fitment notes                                                                              |
| I      | location      | Optional city/location                                                                                                                        |

The existing A–G layout continues working. Add H–I only if useful. A CSV header template is provided in [parts-template.csv](parts-template.csv); import it into a new tab rather than replacing an existing inventory tab.

Give each item a unique slug and keep it unchanged after sharing its link. Missing slugs are generated from the name; duplicates gain a numeric suffix, but explicitly unique slugs keep links stable when rows are reordered.

Append new rows at the bottom: the site displays newest rows first. Remove a row to remove its listing. Non-numeric prices such as `Sold` are displayed as text and excluded from numeric price filters; the enquiry button remains available for questions.

## 2. Upload photos

1. In Cloudinary, create a folder under `Website Inventory`, for example `Website Inventory/Parts/W123-headlight-left`.
2. Upload the photos. Name the cover image `1` or `Thumbnail`.
3. Put only `Parts/W123-headlight-left` in column G. The site adds the parent path automatically.
4. Open `/parts`, then click the part's photo or name to view `/parts/mercedes-w123-headlight-left` and its gallery.

`CLOUDINARY_PARENT_FOLDER` can override `Website Inventory` if the deployment uses another parent. Cloudinary results are cached for five minutes, so photo changes may take that long to appear. Sheet rows are fetched fresh on a page request. A direct image in F is sufficient if galleries are not needed.

## 3. Check enquiries

The Enquire button opens a form requiring name and phone, with optional email/message. The email to `soulcarspakistan@gmail.com` includes part details, its page URL, the customer's contact details, and a WhatsApp reply button. `RESEND_API_KEY` and a verified `RESEND_FROM` sender are needed for delivery.

There is no checkout/payment flow: SoulCars confirms stock and fitment with the customer.

## Local setup and troubleshooting

Copy `.env.example` to `.env.local` and fill it with the existing deployment settings. Never commit credentials. Without Sheets credentials the inventory will be empty; without Resend credentials submitting an enquiry returns an unavailable response.

- Empty inventory: check the tab name `Parts`, name values in column B, spreadsheet ID, and that the existing API key can read the sheet. Check server logs for Sheets errors.
- Missing photos: check the folder path, Cloudinary credentials, and the public fallback URL. Wait five minutes after changing photos.
- No matches: clear search/filters. Search checks name, fitment, description and location. All price ranges are in PKR, even if display currency changes; ranges are below 50,000, 50,000 to below 100,000, and 100,000 upwards.
- Failed emails: check Resend domain verification and `RESEND_FROM`; the sandbox sender only delivers to the account owner.

Before deploying, verify one real listing, its gallery, and a client-approved test enquiry using the actual environment. Local fixture tests do not confirm production credentials or email delivery.
