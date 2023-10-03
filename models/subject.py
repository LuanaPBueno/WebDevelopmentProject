class Subject:
  code: str
  name: str
  credits_amount: int
  prerequisites: list[list[str]]
  '''
    Lista com sublistas de possibilidades de prerequisitos.

    Cada sublista contém strings representando o código de uma matéria.
  '''
  corequisites: list[list[str]]
  '''
    Lista com sublistas de possibilidades de corequisitos.

    Cada sublista contém strings representando o código de uma matéria.
  '''

  def __init__(self, code: str, name: str, credits_amount: int, prerequisites: list[list[str]], corequisites: list[list[str]]) -> None:
    self.code = code
    self.name = name
    self.credits_amount = credits_amount
    self.prerequisites = prerequisites
    self.corequisites = corequisites
