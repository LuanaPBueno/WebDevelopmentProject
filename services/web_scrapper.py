from bs4 import BeautifulSoup
import requests
from models.subject import Subject

class WebScrapper:
  __ALL_COURSES_PAGE = "https://www.puc-rio.br/ensinopesq/ccg/cursos.html"
  __SUBJECT_BASE_URL = "https://www.puc-rio.br/ferramentas/ementas/ementa.aspx?cd="
  __COURSE_BASE_URL = "https://www.puc-rio.br/ensinopesq/ccg/"

  @staticmethod
  def get_subject_from_code(code: str) -> Subject:
    '''
      Retorna um Subject a partir do código da matéria.
    '''
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__SUBJECT_BASE_URL + code)

    name = soup.find(name = "h3", id = "hTitulo").text
    credits_amount = soup.find(name = "h3", id = "hCreditos").text
    credits_amount = credits_amount.replace(" créditos", "")

    return Subject(
      code = code,
      name = name,
      credits_amount = int(credits_amount),
    )

  @staticmethod
  def get_courses() -> list:
    '''
      Retorna uma list de Course com todos os cursos disponíveis no site da PUC.
    '''
    courses = []

    course_pages = WebScrapper.__get_course_pages()
    print(course_pages)

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
      if course.text == '': continue
      if "https://www.cbctc.puc-rio.br" in course['href']: continue
      if WebScrapper.__COURSE_BASE_URL + "engenharia.html" in course['href']: continue

      course_name = course.text
      course_link = WebScrapper.__COURSE_BASE_URL + course['href']
      course_pages[course_name] = course_link

    return course_pages
