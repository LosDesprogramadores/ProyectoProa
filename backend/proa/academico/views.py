from django.db import transaction
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response

from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from .models import Materia, Inscripcion
from .serializer import MateriaSerializer, InscripcionSerializer, PersonaResumenSerializer
from usuario.models import Persona



@extend_schema_view(
    list=extend_schema(
        summary="Listar materias (con filtros opcionales de profesor)",
        parameters=[
            OpenApiParameter(
                name='profesor',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='ID del profesor: trae únicamente las materias que tiene asignadas.',
                required=False
            ),
            OpenApiParameter(
                name='excluir_profesor',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='ID del profesor: trae las materias que NO pertenecen a este profesor (disponibles o de otros).',
                required=False
            ),
        ]
    )
)
class MateriaViewSet(viewsets.ModelViewSet):
    queryset = Materia.objects.select_related('profesor').all()
    serializer_class = MateriaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['titulo', 'anio', 'curso']

    @action(detail=False, methods=['post'], url_path='asignar-profesor')
    def asignar_profesor(self, request):
        profesor_id = request.data.get('profesor_id') or request.data.get('profesor')
        materia_ids = request.data.get('materia_ids') or request.data.get('materias', [])

        if not profesor_id:
            return Response(
                {'error': 'El campo profesor_id es obligatorio.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not isinstance(materia_ids, list) or len(materia_ids) == 0:
            return Response(
                {'error': 'Debes enviar un array materia_ids con al menos un ID.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        Materia.objects.filter(profesor_id=profesor_id).exclude(id__in=materia_ids).update(profesor=None)
        actualizadas = Materia.objects.filter(id__in=materia_ids).update(profesor_id=profesor_id)

        return Response({
            'mensaje': f'Se asignó el profesor a {actualizadas} materias correctamente.',
            'profesor_id': profesor_id,
            'materia_ids': materia_ids
        }, status=status.HTTP_200_OK)

    def get_queryset(self):

        queryset = super().get_queryset()      
        profesor_id = self.request.query_params.get('profesor')
        excluir_profesor = self.request.query_params.get('excluir_profesor')

        if profesor_id:
            return queryset.filter(profesor_id=profesor_id)

        if excluir_profesor:
            return queryset.exclude(profesor_id=excluir_profesor)

        return queryset


class InscripcionViewSet(viewsets.ModelViewSet):

    queryset = Inscripcion.objects.select_related('materia', 'estudiante__rol').all()
    serializer_class = InscripcionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_inscripcion', 'estado']

    def get_queryset(self):
        queryset = super().get_queryset()
        materia_id = self.request.query_params.get('materia')
        estudiante_id = self.request.query_params.get('estudiante')

        if materia_id:
            queryset = queryset.filter(materia_id=materia_id)
        if estudiante_id:
            queryset = queryset.filter(estudiante_id=estudiante_id)

        return queryset