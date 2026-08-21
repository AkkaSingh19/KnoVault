import requests

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg3MjY4NjUxLCJpYXQiOjE3ODcyNjgzNTEsImp0aSI6IjJjMTc1YWNkZTZhMDQ1ODBiZDJjNjY1Yzg2M2E3ZWZiIiwidXNlcl9pZCI6IjEifQ.2WQY06OYF9fFPfYTz_tNPTvZikTYJC2AKG5ps1UFE-E"
url = "http://localhost:8000/api/documents/upload/"
pdf_path = r"C:\Users\aarya\Downloads\test.pdf"  # adjust to wherever you saved it

with open(pdf_path, "rb") as f:
    response = requests.post(
        url,
        headers={"Authorization": f"Bearer {token}"},
        files={"file": f}
    )

print(response.status_code)
print(response.json())