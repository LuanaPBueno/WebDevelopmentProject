from django.shortcuts import render
from .models import Materias

def home(request):
    materias = Materias.objects.all()
    return render(request, 'materias.html', {'materias': materias})
