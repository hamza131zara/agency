"""Smoke-test the PHP contact endpoint without sending real email."""
import http.cookiejar,json,socket,subprocess,time,urllib.error,urllib.parse,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def free_port():
 with socket.socket() as sock:
  sock.bind(("127.0.0.1",0)); return sock.getsockname()[1]
def main():
 if (ROOT/"config.php").exists(): raise AssertionError("CI must not run with live config.php")
 port=free_port()
 server=subprocess.Popen(["php","-S",f"127.0.0.1:{port}","-t",str(ROOT)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
 base=f"http://127.0.0.1:{port}"
 opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
 try:
  token=None
  for _ in range(60):
   if server.poll() is not None: raise AssertionError("PHP server exited at startup")
   try:
    with opener.open(base+"/contact.php?csrf=1",timeout=1) as response:
     data=json.loads(response.read().decode())
     assert response.status==200 and data["ok"] is True and data["configured"] is False
     token=data["csrf_token"]; assert len(token)>=32; break
   except (urllib.error.URLError,TimeoutError,ConnectionError): time.sleep(.1)
  assert token,"PHP test server did not become ready"
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode({"name":"Test"}).encode(),method="POST"),timeout=2)
   raise AssertionError("missing CSRF token was accepted")
  except urllib.error.HTTPError as error:
   assert error.code==403 and json.loads(error.read().decode())["code"]=="csrf_failed"
  fields={"csrf_token":token,"name":"Test User","email":"test@example.org","interest":"Full-stack development","message":"This is a smoke test of the contact form endpoint.","website":""}
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode(fields).encode(),method="POST"),timeout=2)
   raise AssertionError("unconfigured contact form claimed success")
  except urllib.error.HTTPError as error:
   data=json.loads(error.read().decode())
   assert error.code==503 and data["ok"] is False and data["code"]=="not_configured"
   assert "not been sent" in data["message"]
  try:
   opener.open(base+"/contact.php",timeout=2); raise AssertionError("unsupported GET unexpectedly succeeded")
  except urllib.error.HTTPError as error: assert error.code==405
  print("Contact endpoint smoke tests passed: CSRF, missing-config status and method handling.")
 finally:
  server.terminate()
  try: server.wait(timeout=5)
  except subprocess.TimeoutExpired: server.kill(); server.wait(timeout=5)
if __name__=="__main__": main()
