"""
PDF Report Generator using ReportLab.
Generates a professional monthly financial report.
"""
import io
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, String
from reportlab.graphics.charts.barcharts import VerticalBarChart


# --- Color constants ---
DARK_BG = colors.HexColor("#0f172a")
ACCENT_BLUE = colors.HexColor("#3b82f6")
GREEN = colors.HexColor("#22c55e")
RED = colors.HexColor("#ef4444")
YELLOW = colors.HexColor("#eab308")
LIGHT_GRAY = colors.HexColor("#f1f5f9")
WHITE = colors.white


def _score_color(score: int):
    """Get color indicator based on FinScore."""
    if score >= 70:
        return GREEN
    elif score >= 40:
        return YELLOW
    return RED


def _amount_color(amount: float):
    """Green for positive, red for negative."""
    return GREEN if amount >= 0 else RED


def generate_monthly_report(dashboard_data: dict, insights_text: str) -> bytes:
    """
    Generate a complete PDF monthly financial report.
    Returns PDF content as bytes.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=20 * mm, bottomMargin=20 * mm,
        leftMargin=15 * mm, rightMargin=15 * mm
    )
    styles = getSampleStyleSheet()
    elements = []

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"],
        fontSize=22, textColor=DARK_BG, spaceAfter=6
    )
    heading_style = ParagraphStyle(
        "SectionHead", parent=styles["Heading2"],
        fontSize=14, textColor=DARK_BG, spaceBefore=14, spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyText", parent=styles["Normal"],
        fontSize=10, leading=14
    )

    now = datetime.now()
    profile = dashboard_data.get("profile", {})
    first_name = profile.get("name", "User").split()[0]
    finscore = profile.get("finscore", 0)
    income = dashboard_data.get("income", 0)
    spent = dashboard_data.get("spent", 0)
    saved = dashboard_data.get("saved", 0)
    savings_rate = dashboard_data.get("savings_rate", 0)
    forecast = dashboard_data.get("forecast", 0)
    categories = dashboard_data.get("categories", {})
    weekly_trend = dashboard_data.get("weekly_trend", {})
    goals = dashboard_data.get("goals", [])
    streak = profile.get("streak_days", 0)

    # ========== PAGE 1 — HEADER ==========
    elements.append(Paragraph("FinCoach AI — Monthly Financial Report", title_style))
    elements.append(Paragraph(
        f"<b>User:</b> {first_name}  |  <b>Period:</b> {now.strftime('%B %Y')}  |  "
        f"<b>Generated:</b> {now.strftime('%d %b %Y, %I:%M %p')}",
        body_style
    ))
    elements.append(Spacer(1, 8))

    # FinScore display
    score_color_name = "green" if finscore >= 70 else ("orange" if finscore >= 40 else "red")
    elements.append(Paragraph(
        f'<font size="28" color="{score_color_name}"><b>FinScore: {finscore}/100</b></font>',
        ParagraphStyle("Score", alignment=1, spaceAfter=10)
    ))
    elements.append(Spacer(1, 6))

    # ========== FINANCIAL SUMMARY TABLE ==========
    elements.append(Paragraph("📊 Financial Summary", heading_style))
    summary_data = [
        ["Metric", "Amount"],
        ["Total Income", f"₹{income:,.0f}"],
        ["Total Spent", f"₹{spent:,.0f}"],
        ["Total Saved", f"₹{saved:,.0f}"],
        ["Savings Rate", f"{savings_rate * 100:.1f}%"],
        ["Month-end Forecast", f"₹{forecast:,}"],
        ["Saving Streak", f"{streak} days"],
    ]
    summary_table = Table(summary_data, colWidths=[200, 200])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 12))

    # ========== SPENDING BY CATEGORY TABLE ==========
    elements.append(Paragraph("📂 Spending by Category", heading_style))
    cat_data = [["Category", "Amount", "% of Income", "Status"]]
    for cat, amt in sorted(categories.items(), key=lambda x: -x[1]):
        pct = (amt / income * 100) if income > 0 else 0
        status = "✅ OK" if pct < 20 else ("⚠️ High" if pct < 30 else "🔴 Critical")
        cat_data.append([cat, f"₹{amt:,.0f}", f"{pct:.1f}%", status])

    cat_table = Table(cat_data, colWidths=[120, 100, 100, 80])
    cat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(cat_table)
    elements.append(Spacer(1, 10))

    # ========== PAGE 2 — WEEKLY TREND CHART ==========
    elements.append(PageBreak())
    elements.append(Paragraph("📈 Weekly Spending Trend", heading_style))

    drawing = Drawing(400, 180)
    chart = VerticalBarChart()
    chart.x = 50
    chart.y = 20
    chart.width = 300
    chart.height = 130
    chart.data = [list(weekly_trend.values())]
    chart.categoryAxis.categoryNames = list(weekly_trend.keys())
    chart.bars[0].fillColor = ACCENT_BLUE
    chart.valueAxis.valueMin = 0
    chart.valueAxis.valueMax = max(weekly_trend.values()) * 1.2 if weekly_trend else 10000
    chart.valueAxis.valueStep = max(1, int(max(weekly_trend.values(), default=1000) / 5))
    drawing.add(chart)
    elements.append(drawing)
    elements.append(Spacer(1, 12))

    # ========== AI INSIGHTS SECTION ==========
    elements.append(Paragraph("🤖 AI Insights & Recommendations", heading_style))
    # Split insights_text into paragraphs
    for para in insights_text.split("\n"):
        if para.strip():
            elements.append(Paragraph(para.strip(), body_style))
            elements.append(Spacer(1, 3))
    elements.append(Spacer(1, 10))

    # ========== GOALS PROGRESS ==========
    elements.append(Paragraph("🎯 Goals Progress", heading_style))
    goals_data = [["Goal", "Current", "Target", "Progress"]]
    for g in goals:
        target = g.get("target_amount", 1)
        current = g.get("current_amount", 0)
        pct = round((current / target * 100) if target > 0 else 0)
        goals_data.append([
            g.get("name", "Unknown"),
            f"₹{current:,.0f}",
            f"₹{target:,.0f}",
            f"{pct}%"
        ])

    goals_table = Table(goals_data, colWidths=[120, 100, 100, 80])
    goals_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK_BG),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(goals_table)
    elements.append(Spacer(1, 20))

    # ========== FOOTER ==========
    elements.append(Paragraph("─" * 60, body_style))
    elements.append(Paragraph(
        f"<i>Generated by FinCoach AI  |  {now.strftime('%d %b %Y, %I:%M %p')}</i>",
        ParagraphStyle("Footer", fontSize=8, textColor=colors.grey, alignment=1)
    ))
    elements.append(Paragraph(
        "<i>This report is for personal guidance only. Not financial advice.</i>",
        ParagraphStyle("Disclaimer", fontSize=7, textColor=colors.grey, alignment=1)
    ))

    doc.build(elements)
    return buffer.getvalue()
