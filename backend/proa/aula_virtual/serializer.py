from rest_framework import serializers
from .models import Unidad

class UnidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unidad
        fields = ['id', 'materia', 'numero', 'titulo', 'descripcion', 'orden']
        read_only_fields = ['id']

    def validate(self, attrs):
        materia = attrs.get('materia')
        numero = attrs.get('numero')

        if not materia and self.instance:
            materia = self.instance.materia

        if materia and numero is not None:
            qs = Unidad.objects.filter(materia=materia, numero=numero)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({'numero': f'Ya existe una Unidad con el número {numero} para esta materia.'})
        return attrs
