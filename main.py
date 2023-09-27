from __future__ import annotations
from services.web_scrapper import WebScrapper

subject = WebScrapper.get_subject_from_code("CTC4002")
print(subject.code, subject.name, subject.credits_amount)

for prerequisite in subject.prerequisites:
    print(prerequisite)
