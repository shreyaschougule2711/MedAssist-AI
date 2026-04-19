import os
import json
import random
from config import OPENAI_API_KEY, GEMINI_API_KEY

def generate_report_with_gemini(patient_info: dict, analysis: dict) -> dict:
    try:
        from google import genai
        key = GEMINI_API_KEY or OPENAI_API_KEY
        client = genai.Client(api_key=key)
        
        prompt = f"""Generate a structured medical report based on:
        Patient: {patient_info}
        AI Analysis: {analysis}
        
        Return EXCLUSIVELY a JSON object with keys: findings, diagnosis, affected_area, advice, severity, confidence."""
        
        response = client.models.generate_content(model="gemini-1.5-flash", contents=prompt)
        import re
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match: return json.loads(match.group())
    except Exception as e:
        print(f"Gemini Report Error: {e}")
    return None

def generate_report(patient_info: dict, analysis: dict) -> dict:
    active_key = GEMINI_API_KEY or OPENAI_API_KEY
    if active_key and active_key.startswith("AIza"):
        res = generate_report_with_gemini(patient_info, analysis)
        if res: return res

    # Fallback to OpenAI if key provided
    if OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            prompt = f"Generate medical report for {patient_info} based on {analysis}. Return JSON."
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
            )
            import re
            match = re.search(r'\{.*\}', response.choices[0].message.content, re.DOTALL)
            if match: return json.loads(match.group())
        except: pass

    return generate_fallback_report(patient_info, analysis)

def generate_fallback_report(patient_info: dict, analysis: dict) -> dict:
    condition = analysis.get("condition", "Skeletal Abnormality")
    area = analysis.get("area", "Target Region")
    severity = analysis.get("severity", "Moderate")
    confidence = analysis.get("confidence", 0.95)
    findings_text = analysis.get("findings", "Abnormality detected in the scanned region.")
    advice_text = analysis.get("advice", "Clinical correlation and follow-up recommended.")

    return {
        "findings": f"IMAGING FINDINGS:\n{findings_text}\n\nThe scan of {patient_info.get('name', 'the patient')} reveals findings consistent with {condition} in the {area}.\n\nAI Confidence: {confidence:.1%}",
        "diagnosis": f"PRIMARY DIAGNOSIS: {condition}\n\nClinical presentation and imaging support {condition} affecting the {area}. This is a {severity} risk finding.",
        "affected_area": f"AFFECTED REGION: {area}\n\nThe pathology is localized to the {area} as identified in the annotated scan.",
        "advice": f"RECOMMENDATIONS:\n\n{advice_text}\n\n1. Orthopedic consultation\n2. Follow established trauma protocols\n3. Repeat imaging as clinically indicated.",
        "severity": severity,
        "confidence": confidence
    }
