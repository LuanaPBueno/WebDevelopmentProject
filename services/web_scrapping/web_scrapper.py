from bs4 import BeautifulSoup
import requests
from services.web_scrapping.models.subject import Subject
from services.web_scrapping.models.optative_subjects_group import OptativeSubjectsGroup
from services.web_scrapping.models.course import Course

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
    "",        # tr vazio e o "ou" de design
  ]
  ''' Lista com código de matérias optativas, atividades complementares, etc. '''

  @staticmethod
  def is_code_from_optative_subjects_group(code: str) -> bool:
    '''
      Retorna True caso o código representar um grupo de optativas, caso contrário, é uma matéria normal.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)
    return soup.find(name = "fieldset", id = "grupoDisciplina") != None, soup

  @staticmethod
  def get_subject_from_code(code: str, soup = None) -> Subject:
    '''
      Retorna um Subject a partir do código da matéria.
    '''
    if soup == None: soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)

    name = soup.find(name = "h3", id = "hTitulo").text
    credits_amount_string = soup.find(name = "h3", id = "hCreditos").text
    credits_amount = ""
    for character in credits_amount_string:
      if character >= '0' and character <= '9':
        credits_amount += character
    credits_amount = int(credits_amount)

    return Subject(
      code = code,
      name = name,
      credits_amount = credits_amount,
      prerequisites = WebScrapper.get_subject_prerequisites(code),
      corequisites = WebScrapper.get_corequisites(code),
    )

  @staticmethod
  def get_optative_subjects_group_from_code(code: str, soup = None) -> OptativeSubjectsGroup:
    '''
      Retorna um OptativeSubjectsGroup a partir do código da matéria.
    '''
    if soup == None: soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)

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
    if pre_requisites_fieldset == None or "Nenhum pre-requisito encontrado" in pre_requisites_fieldset.text:
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
  def get_corequisites(subject_code: str) -> list[list[str]]:
    '''
      Retorna uma list com códigos de disciplinas que são co-requisitos do código da disciplina recebida pelo parâmetro subject_code.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + subject_code)
    corequisites = []

    corequisites_fieldset = soup.find(name = "fieldset", id = "corequisito")
    if corequisites_fieldset == None: return []
    
    for prerequisite_span in corequisites_fieldset.find_all(name = "span", class_ = "links"):
      corequisite = []

      for subject in prerequisite_span.find_all(name = "a"):
        corequisite.append(subject.text)

      corequisites.append(corequisite)

    return corequisites

  @staticmethod
  def get_courses() -> list[Course]:
    '''
      Retorna uma list de Course com todos os cursos disponíveis no site da PUC.
    '''
    courses = []

    course_pages = WebScrapper.__get_course_pages()
    for course_name in course_pages.keys():
      courses.append(
        WebScrapper.get_course_from_name(
          name = course_name,
          link = course_pages[course_name]
        )
      )

    return courses

  @staticmethod
  def get_course_from_name(name: str, link = '') -> Course:
    '''
      Retorna um Course a partir de seu name.
      Pode ser informado o link para aumentar a performance.

      Cursos com especializações precisam ser seguidos pela especialização.
      Pode lançar um erro caso o nome do curso não siga esse padrão.
    '''
    if link == '': link = WebScrapper.__get_course_pages()[name]

    complementary_activities_amount, free_electives_amount = WebScrapper.__get_curriculum_information(link)
    return Course(
      name = name,
      last_curriculum = WebScrapper.__get_last_curriculum(link),
      free_electives_amount = free_electives_amount,
      complementary_activities_amount = complementary_activities_amount,
    )

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
    '''
      A partir do link para página do curso, retorna uma lista com sublistas que representam um período.

      Cada sublista de período contem os códigos das disciplinas do período.
    '''
    soup = WebScrapper.__get_soup_from_link(course_page)
    curriculum = []

    curriculum_tbody = soup.find(name = "table", class_ = "puc_tabela_padrao_TAG-TABLE ccg_tabela_periodizacao")
    period = []
    for tr in curriculum_tbody.find_all(name = "tr"):
      if "Nome da Disciplina" in tr.text:
        continue
      elif "PERÍODO LETIVO INDETERMINADO" in tr.text.upper():
        if len(period) > 0: curriculum.append(period)
        break
      elif "PERÍODO" in tr.text.upper() or "CICLO" in tr.text.upper():
        if len(period) > 0: curriculum.append(period)
        period = []
      elif tr.find(name = "a"):
        subject_code = tr.find(name = "a").text.strip().replace(" ", "")
        if subject_code not in WebScrapper.__SPECIAL_SUBJECTS:
          period.append(subject_code)

    return curriculum

  @staticmethod
  def __get_curriculum_information(course_page: str) -> tuple[int, int]:
    '''
      Retorna a quantidade de horas complementares e eletivas livres de um curso a partir da sua página.
    '''
    soup = WebScrapper.__get_soup_from_link(course_page)
    complementary_activities_amount = 0
    free_electives_amount = 0

    curriculum_tbody = soup.find(name = "table", class_ = "puc_tabela_padrao_TAG-TABLE ccg_tabela_periodizacao")
    for tr in curriculum_tbody.find_all(name = "tr"):
      if "ACP0900" in tr.text:
        tds = tr.find_all(name = "td")
        complementary_activities_amount = int(tds[2].text.strip())
      elif "ELL0900" in tr.text or "ELU0900" in tr.text:
        tds = tr.find_all(name = "td")
        free_electives_amount = int(tds[2].text.strip())

    return complementary_activities_amount, free_electives_amount
