class Course:
  name: str
  last_curriculum: list[list[str]]
  credits_amount: int
  extension_hours_amount: int

  def __init__(self, name: str, last_curriculum: list[list[str]]) -> None:
    self.name = name
    self.last_curriculum = last_curriculum

  def includes_subject(self, subject_code: str) -> bool:
    for period in self.last_curriculum:
      for subject in period:
        if subject == subject_code:
          return True
    return False
