from bs4 import BeautifulSoup
import requests

class WebScrapper:
  __ALL_COURSES_PAGE = "https://www.puc-rio.br/ensinopesq/ccg/cursos.html"

  @staticmethod
  def get_courses():
    '''
      Retorna uma list de Course com todos os cursos disponíveis no site da PUC.

      Pode lançar um errro caso o HTTP request para página dos cursos não ocorra normalmente.
    '''
    courses = []

    course_pages = WebScrapper.__get_course_pages()

    return courses

  @staticmethod
  def __get_course_pages() -> dict[str, str]:
    course_pages = {}

    http_response = requests.get(WebScrapper.__ALL_COURSES_PAGE)
    if http_response.status_code != 200:
      raise Exception(f"Error during HTTP request from: {WebScrapper.__ALL_COURSES_PAGE}.\nHTTP response status code: {http_response.status_code}.")

    soup = BeautifulSoup(markup = http_response.text, features = "html.parser")
    course_column = soup.find_all(name = "ul", class_ = "puc_lista_recuada_TAG-UL")

    for course_list in course_column:
      courses = course_list.find_all(name = "li")
      for course in courses:
        if course.find('a') == None: continue
        if "https://www.cbctc.puc-rio.br" in course.find('a')['href']: continue # tirar o ciclo básico do CTC

        course_name = course.find('a').text
        course_link = "https://www.puc-rio.br/ensinopesq/ccg/" + course.find('a')['href']
        course_pages[course_name] = course_link

    return course_pages
