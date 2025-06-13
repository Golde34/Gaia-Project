from core.domain.request.query_request import SystemRequest
from core.service.onboarding_service import gaia_introduction 

def gaia_intro(query: SystemRequest):
    gaia_introduction_result = gaia_introduction(query)
    return gaia_introduction_result.get("response", {})