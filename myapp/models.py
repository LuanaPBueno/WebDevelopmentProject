from django.db import models

class InterdependenciaGrupos(models.Model):
    materias = models.ManyToManyField('Materias', related_name="interdependencia_grupos")

class CodependenciaGrupos(models.Model):
    materias = models.ManyToManyField('Materias', related_name="codependencia_grupos")


class Materias(models.Model):
    nome = models.CharField(max_length=100, blank=True)
    codigo = models.CharField(max_length=100, blank=True)
    credito = models.PositiveIntegerField()
    interdependencias = models.ManyToManyField(InterdependenciaGrupos, blank=True, related_name="materias_interdependencias")
    codependencias = models.ManyToManyField(CodependenciaGrupos, blank=True,related_name="materias_codependencias") 

class Optativas(models.Model):
    nome = models.CharField(max_length=255)
    codigo = models.CharField(max_length=100, blank=True)
    materias = models.ManyToManyField(Materias, blank=True, related_name='optativa_de')

class CursoMateria(models.Model):
    curso = models.ForeignKey('Cursos', on_delete=models.CASCADE)
    materia = models.ForeignKey(Materias, on_delete=models.CASCADE)
    periodo = models.PositiveIntegerField()

    class Meta:
        unique_together = ('curso', 'materia')

class CursoOptativa(models.Model):
    curso = models.ForeignKey('Cursos', on_delete=models.CASCADE)
    optativa = models.ForeignKey(Optativas, on_delete=models.CASCADE)
    periodo = models.PositiveIntegerField()

    class Meta:
        unique_together = ('curso', 'optativa')

class Cursos(models.Model):
    nome = models.CharField(max_length=255)
    materias = models.ManyToManyField(Materias, blank=True, related_name='curso_de', through='CursoMateria')
    optativas = models.ManyToManyField(Optativas, blank=True, related_name='optativa_de', through='CursoOptativa')





