import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # ScanUpload.jsx
    content = content.replace("api.post(/scans/upload/,", "api.post(`/scans/upload/${selectedPatient.id}`,")

    # ReportView.jsx
    content = content.replace("api.get(/reports/patient/${selectedPatient.id})", "api.get(`/reports/patient/${selectedPatient.id}`)")
    content = content.replace("api.get(/scans/patient/${selectedPatient.id})", "api.get(`/scans/patient/${selectedPatient.id}`)")
    content = content.replace("api.post(/reports/generate/${scanId})", "api.post(`/reports/generate/${scanId}`)")
    
    # ChatAssistant.jsx
    content = content.replace("api.get(/chat/history/${selectedPatient.id})", "api.get(`/chat/history/${selectedPatient.id}`)")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file(r'src\components\ScanUpload.jsx')
fix_file(r'src\components\ReportView.jsx')
fix_file(r'src\components\ChatAssistant.jsx')
print("Fixed interpolations!")
