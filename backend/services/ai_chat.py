from config import OPENAI_API_KEY

MEDICAL_KNOWLEDGE = [
    {"topic": "fracture", "content": "Fractures are breaks in bone continuity. Common types include transverse, oblique, spiral, comminuted, and greenstick. Treatment depends on location, type, and severity. Most fractures require immobilization. Displaced fractures may need surgical reduction. Follow-up imaging is essential to monitor healing."},
    {"topic": "pneumothorax", "content": "Pneumothorax occurs when air enters the pleural space. Small pneumothoraces (<20%) may resolve spontaneously. Larger ones require chest tube drainage. Tension pneumothorax is a medical emergency requiring immediate needle decompression followed by chest tube insertion."},
    {"topic": "tumor", "content": "Tumors can be benign or malignant. Imaging characteristics such as margins, enhancement pattern, and size help differentiate. Biopsy is often needed for definitive diagnosis. Treatment options include surgery, chemotherapy, radiation, and immunotherapy depending on type and stage."},
    {"topic": "acl", "content": "ACL (Anterior Cruciate Ligament) tears are common knee injuries. MRI is the gold standard for diagnosis. Complete tears often require surgical reconstruction, especially in active individuals. Conservative management with physical therapy may be appropriate for partial tears or less active patients."},
    {"topic": "disc herniation", "content": "Disc herniation occurs when the nucleus pulposus protrudes through the annulus fibrosus. L4-L5 and L5-S1 are most commonly affected. Symptoms include radiculopathy, numbness, and weakness. Most cases improve with conservative treatment within 6-12 weeks."},
    {"topic": "cardiomegaly", "content": "Cardiomegaly indicates an enlarged heart, defined as cardiothoracic ratio >0.5 on PA chest X-ray. Common causes include hypertension, valvular disease, cardiomyopathy, and coronary artery disease. Echocardiography is essential for further evaluation."},
    {"topic": "pulmonary nodule", "content": "Pulmonary nodules are round opacities <3cm in the lung. Management follows Fleischner Society guidelines based on size and patient risk factors. Nodules >8mm may require PET-CT or biopsy. Calcified or fat-containing nodules are typically benign."},
    {"topic": "general", "content": "Medical imaging interpretation requires systematic approach. Always compare with prior studies when available. Clinical correlation is essential. Consider patient age, symptoms, and risk factors. Follow established guidelines for follow-up imaging recommendations."},
]


def get_relevant_knowledge(query: str) -> str:
    query_lower = query.lower()
    relevant = []
    for item in MEDICAL_KNOWLEDGE:
        if item["topic"] in query_lower or any(word in query_lower for word in item["topic"].split()):
            relevant.append(item["content"])
    if not relevant:
        relevant = [item["content"] for item in MEDICAL_KNOWLEDGE if item["topic"] == "general"]
    return "\n\n".join(relevant[:3])


def generate_chat_response(message: str, patient_context: dict = None) -> str:
    context_str = ""
    if patient_context:
        context_str = f"""
Patient: {patient_context.get('name', 'Unknown')}, Age: {patient_context.get('age', 'N/A')}, Gender: {patient_context.get('gender', 'N/A')}
Notes: {patient_context.get('notes', 'None')}
"""
        if patient_context.get('latest_scan'):
            scan = patient_context['latest_scan']
            context_str += f"Latest Scan: {scan.get('scan_type', 'N/A')} - {scan.get('condition', 'Pending analysis')}\n"
            context_str += f"Findings: {scan.get('findings', 'N/A')}\n"

    knowledge = get_relevant_knowledge(message)

    if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here":
        try:
            from openai import OpenAI
            client = OpenAI(api_key=OPENAI_API_KEY)
            system_prompt = f"""You are MedAssist AI, a medical assistant for doctors. Provide accurate, concise, helpful medical information.
Always include a disclaimer that AI suggestions are not final diagnoses and should be verified by the treating physician.

Medical Knowledge Context:
{knowledge}

Patient Context:
{context_str if context_str else 'No specific patient selected.'}"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI error: {e}")

    return generate_fallback_response(message, context_str, knowledge)


def generate_fallback_response(message: str, context: str, knowledge: str) -> str:
    msg = message.lower()

    if "summarize" in msg or "summary" in msg:
        if context:
            return f"""**Case Summary**

{context}

Based on the available medical knowledge:
{knowledge[:300]}

*Note: This is an AI-generated summary. Please verify all findings independently. AI suggestions are not final diagnoses.*"""
        return "Please select a patient to generate a case summary. I need patient context to provide an accurate summary.\n\n*AI suggestions are not final diagnoses.*"

    if "diagnosis" in msg or "diagnos" in msg:
        return f"""**Diagnostic Assessment**

{knowledge[:400]}

**Key Considerations:**
- Correlate imaging findings with clinical presentation
- Review patient history for relevant risk factors
- Consider differential diagnoses
- Follow-up imaging may be warranted

*Disclaimer: AI suggestions are not final diagnoses. All findings must be verified by the treating physician.*"""

    if "precaution" in msg or "advice" in msg or "suggest" in msg:
        return f"""**Clinical Recommendations**

Based on the available information:

1. **Monitoring**: Regular follow-up appointments and imaging as indicated
2. **Medication**: Follow established protocols for pain management and treatment
3. **Lifestyle**: Advise appropriate activity modifications
4. **Follow-up**: Schedule next review in recommended timeframe
5. **Red Flags**: Educate patient on warning signs requiring immediate attention

{knowledge[:200]}

*Disclaimer: AI suggestions are not final diagnoses. Treatment decisions should be made by the treating physician.*"""

    if "explain" in msg:
        return f"""**Medical Explanation**

{knowledge[:500]}

For more detailed information, please specify the condition or finding you would like explained.

*Disclaimer: AI suggestions are not final diagnoses.*"""

    return f"""Thank you for your question. Based on available medical knowledge:

{knowledge[:400]}

**Would you like me to:**
- Summarize a specific case?
- Explain a diagnosis in detail?
- Provide treatment recommendations?
- Review precautions for a condition?

Please select a patient for context-aware responses.

*Disclaimer: AI suggestions are not final diagnoses. All clinical decisions should be made by qualified medical professionals.*"""