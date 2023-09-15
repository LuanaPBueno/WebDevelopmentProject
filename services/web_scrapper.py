from bs4 import BeautifulSoup
import requests
from models.subject import Subject

class WebScrapper:
  __ALL_COURSES_PAGE = "https://www.puc-rio.br/ensinopesq/ccg/cursos.html"
  __SUBJECT_BASE_URL = "https://www.puc-rio.br/ferramentas/ementas/ementa.aspx?cd="

  @staticmethod
  def get_subject_from_code(code: str) -> Subject:
    '''
      Retorna um Subject a partir do seu código.
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
  def get_courses():
    '''
      Retorna uma list de Course com todos os cursos disponíveis no site da PUC.
    '''
    courses = []

    course_pages = WebScrapper.__get_course_pages()

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

    return BeautifulSoup(markup = http_response.text, features = "html.parser")

  @staticmethod
  def __get_course_pages() -> dict[str, str]:
    '''
      Retorna um dicionário contendo todas as matérias e 
    '''
    course_pages = {}
    soup = WebScrapper.__get_soup_from_link(WebScrapper.__ALL_COURSES_PAGE)

    course_column = soup.find_all(name = "ul", class_ = "puc_lista_recuada_TAG-UL")

    for course_list in course_column:
      courses = course_list.find_all(name = "li")
      for course in courses:
        if course.find('a') == None: continue
        if "https://www.cbctc.puc-rio.br" in course.find('a')['href']: continue # desconsiderar o ciclo básico do CTC

        course_name = course.find('a').text # TODO corrijir caracteres especiais
        course_link = "https://www.puc-rio.br/ensinopesq/ccg/" + course.find('a')['href']
        course_pages[course_name] = course_link

    return course_pages
