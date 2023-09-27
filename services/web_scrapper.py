from bs4 import BeautifulSoup
import requests
from models.subject import Subject
from models.optative_subjects_group import OptativeSubjectsGroup
from models.course import Course

class WebScrapper:
  __ALL_COURSES_PAGE = "https://www.puc-rio.br/ensinopesq/ccg/cursos.html"
  __SUBJECT_BASE_URL = "https://www.puc-rio.br/ferramentas/ementas/ementa.aspx?cd="
  __COURSE_BASE_URL = "https://www.puc-rio.br/ensinopesq/ccg/"

  __COURSES_WITH_LICENCIATURE = [
    "Ciências Biológicas",
    "Ciências Sociais",
    "Filosofia",
    "Geografia",
    "História",
  ]

  __SPECIAL_SUBJECTS = [
    "ELO0900", # Eletivas de Orientação
    "EXT0001", # Optativa de Extensão
    "ELL0900", # Eletivas Livres
    "EXT0001", # Optativa de Extensão
  ]
  ''' Lista com código de matérias optativas, atividades complementares, etc. '''

  @staticmethod
  def get_subject_from_code(code: str) -> Subject | list[Subject]:
    '''
      Retorna um Subject a partir do código da matéria.

      Se o código for de um grupo de optativas, retorna uma lista de Subject com todas as opções.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)

    if not soup.find(name = "fieldset", id = "grupoDisciplina"):
      name = soup.find(name = "h3", id = "hTitulo").text
      credits_amount = soup.find(name = "h3", id = "hCreditos").text
      credits_amount = credits_amount.replace(" créditos", "").replace(" crйditos", "")

      return Subject(
        code = code,
        name = name,
        credits_amount = int(credits_amount),
        prerequisites = WebScrapper.get_subject_prerequisites(code)
      )

    else: # Grupo de optativas
      subjects = []

      optative_group = WebScrapper.get_optative_subjects_group_from_code(code)
      for subject_code in optative_group.subjects:
        subjects.append(WebScrapper.get_subject_from_code(subject_code))

      return subjects

  @staticmethod
  def get_optative_subjects_group_from_code(code: str) -> OptativeSubjectsGroup:
    '''
      Retorna um OptativeSubjectsGroup a partir do código da matéria.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)

    subjects_group = soup.find(name = "fieldset", id = "grupoDisciplina")
    if subjects_group == None : raise Exception(f"Subject with code {code} is not a optative subjects group")

    name = soup.find(name = "h3", id = "hTitulo").text
    subjects = []
    for subject in subjects_group.find_all(name = "a"):
      subjects.append(subject.text.strip())

    return OptativeSubjectsGroup(code, name, subjects)

  @staticmethod
  def get_subject_prerequisites(subject_code: str) -> list[list[str]]:
    '''
      Retorna uma lista com sublistas possibilidades de pré-requisitos.

      Cada sublista contém strings representando o código de uma matéria.

      Caso um pré-requisito não seja uma matéria, ele vem com um '_' na frente.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + subject_code)
    prerequisites = []

    pre_requisites_fieldset = soup.find(name = "fieldset", id = "prerequisito")
    if "Nenhum pre-requisito encontrado" in pre_requisites_fieldset.text:
      return []

    for prerequisite_span in pre_requisites_fieldset.find_all(name = "span", class_ = "links"):
      prerequisite = []

      for subject in prerequisite_span.find_all(name = "a"):
        prerequisite.append(subject.text)
      for other_prerequisite in prerequisite_span.find_all(name = "span"):
        if other_prerequisite.text == " e ": continue
        prerequisite.append("_" + other_prerequisite.text.replace("e ", ""))

      prerequisites.append(prerequisite)

    return prerequisites

  @staticmethod
  def get_courses() -> list[Course]:
    '''
      Retorna uma list de Course com todos os cursos disponíveis no site da PUC.
    '''
    courses = []

    course_pages = WebScrapper.__get_course_pages()
    for course_name in course_pages.keys():
      courses.append(Course(
        name = course_name,
        last_curriculum = WebScrapper.__get_last_curriculum(course_pages[course_name]),
      ))

    return courses

  @staticmethod
  def __get_soup_from_link(link: str) -> BeautifulSoup:
    '''
      Faz o HTTP request para acessar a página e retorna uma BeautifulSoup a partir do link fornecido.

      Pode lançar um errro caso o HTTP request para página dos cursos não ocorra normalmente.
    '''
    http_response = requests.get(link)
    if http_response.status_code != 200:
      raise Exception(f"Error during HTTP request from: {WebScrapper.__ALL_COURSES_PAGE}.\nHTTP response status code: {http_response.status_code}.")
    http_response.encoding = http_response.apparent_encoding

    return BeautifulSoup(markup = http_response.text, features = "html.parser")

  @staticmethod
  def __get_course_pages() -> dict[str, str]:
    '''
      Retorna um dicionário contendo todas as matérias e 
    '''
    course_pages = {}
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__ALL_COURSES_PAGE)

    courses_div = soup.find(name = "div", class_ = "puc_layout_coluna_2cols_nivelador")
    for course in courses_div.find_all(name = 'a'):
      # links que não são cursos
      if course.text == '': continue
      if "https://www.cbctc.puc-rio.br" in course['href']: continue
      if "Engenharias" in course.text: continue
      if "Comunicação Social" in course.text: continue # curso substituído por Estudos de Mídia

      course_name = course.text.replace("- NOVO!", "").strip()
      course_link = WebScrapper.__COURSE_BASE_URL + course['href']

      # modificações nos links
      for name in WebScrapper.__COURSES_WITH_LICENCIATURE:
        if name in course_name:
          course_link = course_link.replace(".html", "_bacharelado.html")

      if "Letras" not in course_name:
        course_pages[course_name] = course_link
      else:
        course_pages["Letras – Português e Inglês e Respectivas Literaturas"] = WebScrapper.__COURSE_BASE_URL + "letras_port-ing.html"
        course_pages["Letras - Tradução"] = WebScrapper.__COURSE_BASE_URL + "letras_traducao.html"
        course_pages["Letras - Produção Textual"] = WebScrapper.__COURSE_BASE_URL + "letras_prod-texto.html"

    return course_pages

  @staticmethod
  def __get_last_curriculum(course_page: str) -> list[list[str]]:
    soup = WebScrapper.__get_soup_from_link(course_page)
    curriculum = []

    curriculum_tbody = soup.find(name = "table", class_ = "puc_tabela_padrao_TAG-TABLE ccg_tabela_periodizacao")
    period = []
    for tr in curriculum_tbody.find_all(name = "tr"):
      if "Nome da Disciplina" in tr.text:
        continue
      elif "PERÍODO LETIVO INDETERMINADO" in tr.text:
        if len(period) > 0: curriculum.append(period)
        break
      elif "PERÍODO" in tr.text.upper():
        if len(period) > 0: curriculum.append(period)
        period = []
      elif tr.find(name = "a"):
        subject_code = tr.find(name = "a").text.strip()
        if subject_code not in WebScrapper.__SPECIAL_SUBJECTS:
          period.append(subject_code)

    # TODO https://www.puc-rio.br/ensinopesq/ccg/estudos_de_midia.html
    # TODO https://www.puc-rio.br/ensinopesq/ccg/design.html
    # TODO pegar informações de atividades complementares, ect.

    return curriculum
