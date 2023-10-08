from django.core.management.base import BaseCommand
from myapp.models import Materias
from myapp.models import Cursos
from myapp.models import Optativas
from myapp.models import CursoMateria
from myapp.models import CursoOptativa
from myapp.models import InterdependenciaGrupos
from myapp.models import CodependenciaGrupos
from services.web_scrapper import WebScrapper

class Command(BaseCommand):
    help = 'Adiciona matérias ao banco de dados'

    def handle(self, *args, **kwargs):
        
        cursos = WebScrapper.get_courses()
        for curso in cursos:

            cursoVar = Cursos.objects.create(nome=curso.name)
            cursoatual = WebScrapper.get_course_from_name(curso.name)

            print(" \nCurso atual é: " + curso.name)
            for numero, periodo in enumerate(cursoatual.last_curriculum):

                print("   \nPeriodo atual é: " + str(numero+1))

                for codigo in periodo:
                    if WebScrapper.is_code_from_optative_subjects_group(codigo):

                        optative_group = WebScrapper.get_optative_subjects_group_from_code(codigo)

                        print("   \nOptativa encontrada!")
                        print("  Nome da Optativa: " + optative_group.name)

                        if verificarNaoExistencia(codigo):
                            optativaVar = criarOptativa(optative_group, curso, codigo)
                        else:
                            print("A Optativa já existe!")

                        CursoOptativa.objects.create(curso=cursoVar, optativa=optativaVar, periodo=(numero+1))
                    else:
                        materia = WebScrapper.get_subject_from_code(codigo)

                        print("     \nMatéria é: " + materia.name)
                        print("    Código: " + materia.code)
                        print("    Crédito: " + str(materia.credits_amount))

                        if verificarNaoExistencia(codigo):
                            materiaVar = criarMateria(materia)
                        else:
                            print("A Matéria já existe!")
                    
                        CursoMateria.objects.create(curso=cursoVar, materia=materiaVar, periodo=(numero+1))
                        
                        adicionarPrerequisitos(materia.prerequisites, curso, materiaVar)
                        adicionarCorequisitos(materia.corequisites, curso, materiaVar)

        self.stdout.write(self.style.SUCCESS('Matérias adicionadas com sucesso!'))

def verificarNaoExistencia(codigo):
    naoExiste = True

    if Materias.objects.get(codigo=codigo) != None or Optativas.objects.get(codigo=codigo) != None:
        naoExiste = False

    return naoExiste

def criarMateria(materia):
    materiaVar = Materias.objects.create(
        nome = materia.name,
        codigo = materia.code,
        credito = materia.credits_amount
        )
    
    return materiaVar

def criarOptativa(optative_group, curso, codigo):
    optativaVar = Optativas.objects.create(nome=optative_group.name, codigo=optative_group.code)

    for subject_code in optative_group.subjects:
        materiaL = WebScrapper.get_subject_from_code(subject_code)

        print("       \nMatéria da optativa: " + materiaL.name)

        print("      Código: " + materiaL.code)
        print("      Crédito: " + str(materiaL.credits_amount))

        if verificarNaoExistencia(codigo):
            materiaVar = criarMateria(materiaL)
        else:
            print("A Matéria já existe!")

        adicionarPrerequisitos(materiaL.prerequisites, curso, materiaVar)
        adicionarCorequisitos(materiaL.corequisites, curso, materiaVar)

        optativaVar.materias.add(materiaVar)
    
    return optativaVar

def adicionarPrerequisitos(lista_prerequisitos, curso, materiaVar):
    for prerequisito_lista in lista_prerequisitos:
                                
        preqVar = InterdependenciaGrupos.objects.create()

        podeAdicionar = True
                                
        for prerequisito in prerequisito_lista:
            if not curso.includes_subject(prerequisito):
                podeAdicionar = False

        if podeAdicionar == True:
            print("     \nConjunto de Pré-Requisitos:")
            for prerequisito in prerequisito_lista:
                                        
                print("        A matéria tem [" + prerequisito + "] como pré requisito")
                materia_interdependente = Materias.objects.get(codigo=prerequisito) 
                preqVar.materias.add(materia_interdependente) 
                            
        materiaVar.interdependencias.add(preqVar)

def adicionarCorequisitos(lista_corequisitos, curso, materiaVar):
    for corequisito_lista in lista_corequisitos:
                                
        coreqVar = CodependenciaGrupos.objects.create()

        podeAdicionar = True
                                
        for corequisito in corequisito_lista:
            if not curso.includes_subject(corequisito):
                podeAdicionar = False

        if podeAdicionar == True:
            print("   \nConjunto de Co-Requisitos:")
            for corequisito in corequisito_lista:
                                       
                print("    A matéria tem [" + corequisito + "] como co requisito")
                materia_codependente = Materias.objects.get(codigo=corequisito) 
                coreqVar.materias.add(materia_codependente) 
                                     
        materiaVar.codependencias.add(coreqVar)  

