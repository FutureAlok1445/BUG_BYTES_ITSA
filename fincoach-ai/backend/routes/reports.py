"""
Reports route — PDF financial report generation and preview.
"""
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
import io
from routes.dashboard import get_dashboard
from services.groq_ai import get_ai_insights, BACKUP_INSIGHTS
from services.data_sanitizer import build_safe_ai_context
from services.report_generator import generate_monthly_report
from security.rate_limiter import limiter, REPORTS_LIMIT

router = APIRouter()


@router.get("/reports/download")
@limiter.limit(REPORTS_LIMIT)
def download_report(request: Request):
    """Generate and download a PDF financial report. Rate limited: 3/min."""
    try:
        dashboard_data = get_dashboard(request)

        # Get AI insights for the report
        safe_context = build_safe_ai_context({
            "name": dashboard_data["profile"]["name"],
            "finscore": dashboard_data["profile"]["finscore"],
            "personality_type": dashboard_data["profile"]["personality_type"],
            "income": dashboard_data["income"],
            "spent": dashboard_data["spent"],
            "categories": dashboard_data["categories"],
            "goals": dashboard_data["goals"],
        })
        insights_text, _ = get_ai_insights(safe_context)

        # Generate PDF
        pdf_bytes = generate_monthly_report(dashboard_data, insights_text)

        now = datetime.now()
        filename = f"fincoach_report_{now.strftime('%b')}_{now.year}.pdf"

        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        print(f"Report download error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")


@router.get("/reports/preview")
@limiter.limit(REPORTS_LIMIT)
def preview_report(request: Request):
    """Get report data as JSON for frontend preview."""
    try:
        dashboard_data = get_dashboard(request)

        safe_context = build_safe_ai_context({
            "name": dashboard_data["profile"]["name"],
            "finscore": dashboard_data["profile"]["finscore"],
            "income": dashboard_data["income"],
            "spent": dashboard_data["spent"],
            "categories": dashboard_data["categories"],
            "goals": dashboard_data["goals"],
        })
        insights_text, is_fallback = get_ai_insights(safe_context)

        return {
            "dashboard": dashboard_data,
            "insights": insights_text,
            "is_fallback": is_fallback,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Report preview error: {e}")
        raise HTTPException(status_code=500, detail="Failed to preview report")
