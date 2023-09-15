class Subject:
  code: str
  name: str
  credits_amount: int
  prerequisites: list
  subsequent_subjects: list

  def __init__(self, code: str, name: str, credits_amount: int) -> None:
    self.code = code
    self.name = name
    self.credits_amount = credits_amount
