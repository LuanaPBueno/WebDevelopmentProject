class Subject:
  code: str
  name: str
  credits_amount: int
  prerequisites: list[list[str]]
  '''
    Lista com sublistas de possibilidades de prerequisitos.

    Cada sublista contém strings representando o código de uma matéria.
  '''

  def __init__(self, code: str, name: str, credits_amount: int) -> None:
    self.code = code
    self.name = name
    self.credits_amount = credits_amount
