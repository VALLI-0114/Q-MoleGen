"""
URL configuration for Q-MoleGen Django REST API with Role-Based Access Control.
"""
from django.urls import path
from . import views

urlpatterns = [
    # Core API Endpoints
    path('api/health/', views.api_health, name='api_health'),
    path('api/candidates/', views.api_get_candidates, name='api_get_candidates'),
    path('api/molecule/<int:mol_id>/', views.api_get_molecule, name='api_get_molecule'),
    path('api/generate/', views.api_generate_candidates, name='api_generate_candidates'),
    path('api/parse-smiles/', views.api_parse_smiles, name='api_parse_smiles'),
    path('api/dataset/esol/', views.api_get_dataset_esol, name='api_get_dataset_esol'),
    path('api/benchmark/', views.api_get_benchmark, name='api_get_benchmark'),
    # Quantum Machine Learning Endpoints
    path('api/quantum/benchmark/', views.api_quantum_benchmark, name='api_quantum_benchmark'),
    path('api/quantum/predict/', views.api_quantum_predict, name='api_quantum_predict'),
    path('api/quantum/circuit/', views.api_quantum_circuit, name='api_quantum_circuit'),

    # Admin RBAC Endpoints
    path('api/admin/users/', views.api_admin_users, name='api_admin_users'),
    path('api/admin/users/toggle/', views.api_admin_toggle_user, name='api_admin_toggle_user'),
    path('api/admin/system-stats/', views.api_admin_system_stats, name='api_admin_system_stats'),
    path('api/admin/models/', views.api_admin_models, name='api_admin_models'),
    path('api/admin/error-logs/', views.api_admin_error_logs, name='api_admin_error_logs'),

    # Researcher RBAC Endpoints
    path('api/researcher/experiments/', views.api_researcher_experiments, name='api_researcher_experiments'),
    path('api/researcher/experiments/save/', views.api_researcher_save_experiment, name='api_researcher_save_experiment'),
    path('api/researcher/experiments/delete/', views.api_researcher_delete_experiment, name='api_researcher_delete_experiment'),
    path('api/researcher/stats/', views.api_researcher_stats, name='api_researcher_stats'),

    # Student RBAC Endpoints
    path('api/student/lessons/', views.api_student_lessons, name='api_student_lessons'),

    # Authentication & Supabase APIs
    path('api/auth/register/', views.api_auth_register, name='api_auth_register'),
    path('api/auth/login/', views.api_auth_login, name='api_auth_login'),
    path('api/auth/me/', views.api_auth_me, name='api_auth_me'),
    path('api/database/status/', views.api_database_config_view, name='api_database_status'),
    path('api/contact/', views.api_contact_inquiry, name='api_contact_inquiry'),

    # Experiment Analytics Endpoints
    path('api/analytics/experiments/', views.api_get_analytics_experiments, name='api_get_analytics_experiments'),
    path('api/analytics/data/', views.api_get_experiment_analytics, name='api_get_experiment_analytics'),
    path('api/analytics/data/<str:exp_id>/', views.api_get_experiment_analytics, name='api_get_experiment_analytics_by_id'),

    # Fallback root
    path('', views.api_health, name='root'),
]
