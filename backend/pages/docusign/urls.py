from django.urls import path
from .views import SendContractView

app_name = 'docusign'

urlpatterns = [
    path("send-contract/", SendContractView.as_view()),
]