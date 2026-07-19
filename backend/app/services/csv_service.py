import csv
import io

REQUIRED_COLUMNS = [
    "First Name",
    "Last Name",
    "Title",
    "Company Name",
    "Email",
    "Person Linkedin Url",
    "Company Website",
    "Facebook Url",
    "Twitter Url",
]

HEADER_TO_FIELD = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Title": "title",
    "Company Name": "company_name",
    "Email": "email",
    "Person Linkedin Url": "linkedin_url",
    "Company Website": "company_website",
    "Facebook Url": "facebook_url",
    "Twitter Url": "twitter_url",
}


class CsvValidationError(Exception):
    """User-facing CSV validation error. Message is always safe to show directly."""


def parse_csv(raw_bytes: bytes) -> list[dict[str, str]]:
    """Parses and validates uploaded CSV bytes into a list of row dicts keyed by
    our internal field names. Raises CsvValidationError with a friendly message
    for any empty file, bad encoding, duplicate headers, or missing columns."""
    try:
        text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise CsvValidationError("File is not a valid UTF-8 CSV file.")

    if not text.strip():
        raise CsvValidationError("The CSV file is empty.")

    try:
        rows = list(csv.reader(io.StringIO(text)))
    except csv.Error:
        raise CsvValidationError("Could not parse this file as CSV.")

    if not rows:
        raise CsvValidationError("The CSV file is empty.")

    header = [h.strip() for h in rows[0]]

    if len(header) != len(set(header)):
        raise CsvValidationError("The CSV file has duplicate column headers.")

    missing = [col for col in REQUIRED_COLUMNS if col not in header]
    if missing:
        raise CsvValidationError(f"Missing required column(s): {', '.join(missing)}.")

    parsed: list[dict[str, str]] = []
    for raw_row in rows[1:]:
        if not any(cell.strip() for cell in raw_row):
            continue
        row_dict = dict(zip(header, raw_row))
        parsed.append({field: row_dict.get(col, "").strip() for col, field in HEADER_TO_FIELD.items()})

    if not parsed:
        raise CsvValidationError("The CSV file has no data rows.")

    return parsed
