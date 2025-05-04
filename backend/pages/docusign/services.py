import os
from docusign_esign import ApiClient, EnvelopesApi, EnvelopeDefinition, Document, Signer, SignHere, Recipients
from docusign_esign.client.api_exception import ApiException
import base64

def get_access_token(api_client):
    private_key = os.getenv("DOCUSIGN_PRIVATE_KEY").replace('\\n', '\n').encode('utf-8')
    integration_key = os.getenv("DOCUSIGN_CLIENT_ID")
    user_id = os.getenv("DOCUSIGN_USER_ID")
    auth_server = "account-d.docusign.com"  # for sandbox

    try:
        # Configure JWT authorization
        token_response = api_client.request_jwt_user_token(
            client_id=integration_key,
            user_id=user_id,
            oauth_host_name=auth_server,
            private_key_bytes=private_key,
            expires_in=3600,
            scopes=["signature", "impersonation"]
        )
        return token_response.access_token
    except ApiException as e:
        print(f"DocuSign authentication failed: {e}")
        raise

def send_gig_contract(email, name, file_path):
    # Create the API client and authenticate
    api_client = ApiClient()
    api_client.set_base_path(os.getenv('DOCUSIGN_BASE_URL'))
    api_client.set_oauth_host_name("account-d.docusign.com")
    access_token = get_access_token(api_client)

    api_client.set_default_header("Authorization", f"Bearer {access_token}")

    # Read and encode the contract
    with open(file_path, "rb") as f:
        doc_b64 = base64.b64encode(f.read()).decode("utf-8")

    document = Document(
        document_base64=doc_b64,
        name="Gig Contract",
        file_extension="pdf",
        document_id="1"
    )

    signer = Signer(
        email=email,
        name=name,
        recipient_id="1",
        routing_order="1"
    )

    sign_here = SignHere(
        anchor_string="/sig/",
        anchor_units="pixels",
        anchor_x_offset="10",
        anchor_y_offset="20"
    )

    signer.tabs = {"sign_here_tabs": [sign_here]}
    envelope = EnvelopeDefinition(
        email_subject="Please sign the contract",
        documents=[document],
        recipients=Recipients(signers=[signer]),
        status="sent"
    )

    envelopes_api = EnvelopesApi(api_client)
    envelope_summary = envelopes_api.create_envelope(account_id=os.getenv('DOCUSIGN_ACCOUNT_ID'), envelope_definition=envelope)
    return envelope_summary.envelope_id