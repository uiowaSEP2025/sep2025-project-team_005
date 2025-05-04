from rest_framework.views import APIView
from rest_framework.response import Response
from .services import send_gig_contract

class SendContractView(APIView):
    def post(self, request):
        # Example payload: { email, name, job_id }
        email = request.data["email"]
        name = request.data["name"]
        file_path = "/path/to/generated/contract.pdf"

        envelope_id = send_gig_contract(email, name, file_path)
        return Response({"envelope_id": envelope_id})
