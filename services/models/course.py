class Course:
  name: str
  last_curriculum: list[list[str]]
  complementary_activities_amount: int
  free_electives_amount: int

  def __init__(self, name: str, last_curriculum: list[list[str]], complementary_activities_amount: int, free_electives_amount: int) -> None:
    self.name = name
    self.last_curriculum = last_curriculum
    self.complementary_activities_amount = complementary_activities_amount
    self.free_electives_amount = free_electives_amount

  def includes_subject(self, subject_code: str) -> bool:
    for period in self.last_curriculum:
      for subject in period:
        if subject == subject_code:
          return True
    return False
