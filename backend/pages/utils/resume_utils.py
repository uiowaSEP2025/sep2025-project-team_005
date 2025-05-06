import spacy
import re
from pdfminer.high_level import extract_text

nlp = spacy.load("en_core_web_sm")

EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b")
PHONE_REGEX = re.compile(r"\+?\d[\d -]{8,12}\d")

def extract_text_from_pdf(pdf_path):
    return extract_text(pdf_path)

def extract_experience(text):
    lines = text.split('\n')
    experiences = []
    for i, line in enumerate(lines):
        line = line.strip()
        if not line or line.startswith("●"):  # Skip empty and bullet points
            continue
        if re.search(r'(intern|musician|consultant|manager|perform|contract|composer|guitarist)', line, re.IGNORECASE):
            company = lines[i - 1].strip() if i > 0 else None
            # Avoid education being added
            if "university" not in company.lower() and "bachelor" not in line.lower():
                experiences.append({
                    "title": line,
                    "company": company
                })
    return experiences

def parse_resume(file_path):
    text = extract_text_from_pdf(file_path)
    doc = nlp(text)

    return {
        "experience": extract_experience(text),
    }