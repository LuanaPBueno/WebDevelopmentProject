class OptativeSubjectsGroup:
  code: str
  name: str
  subjects: list[str]

  def __init__(self, code: str, name: str, subjects: list[str]) -> None:
    self.code = code
    self.name = name
    self.subjects = subjects
