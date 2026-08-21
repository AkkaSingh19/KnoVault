import requests

token =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzg3MjY4NjUxLCJpYXQiOjE3ODcyNjgzNTEsImp0aSI6IjJjMTc1YWNkZTZhMDQ1ODBiZDJjNjY1Yzg2M2E3ZWZiIiwidXNlcl9pZCI6IjEifQ.2WQY06OYF9fFPfYTz_tNPTvZikTYJC2AKG5ps1UFE-E"
doc_id = 1
url = f"http://localhost:8000/api/documents/{doc_id}/"

response = requests.get(url, headers={"Authorization": f"Bearer {token}"})
print(response.status_code)
print(response.json())