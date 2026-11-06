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
     cookie_headers=response.headers.get_all("Set-Cookie") or []
     cookie_header="; ".join(cookie_headers).lower()
     assert "httponly" in cookie_header and "samesite=strict" in cookie_header and "path=/" in cookie_header, cookie_headers
     token=data["csrf_token"]; assert len(token)>=32; break
   except (urllib.error.URLError,TimeoutError,ConnectionError): time.sleep(.1)
  assert token,"PHP test server did not become ready"
  fixed_session="a"*26
  fixed_request=urllib.request.Request(base+"/contact.php?csrf=1",headers={"Cookie":f"PHPSESSID={fixed_session}"})
  with urllib.request.urlopen(fixed_request,timeout=2) as response:
   replacement_cookies=response.headers.get_all("Set-Cookie") or []
   replacement="; ".join(replacement_cookies)
   assert any(
    cookie.split(";",1)[0].startswith("PHPSESSID=")
    and cookie.split(";",1)[0] != f"PHPSESSID={fixed_session}"
    for cookie in replacement_cookies
   ), replacement
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode({"name":"Test"}).encode(),headers={"Origin":base},method="POST"),timeout=2)
   raise AssertionError("missing CSRF token was accepted")
  except urllib.error.HTTPError as error:
   assert error.code==403 and json.loads(error.read().decode())["code"]=="csrf_failed"
  fields={"csrf_token":token,"name":"Test User","email":"test@example.org","interest":"Software & website development","message":"This is a smoke test of the contact form endpoint.","website":""}
  for headers in ({}, {"Origin":f"http://127.0.0.1:{port+1}"}, {"Origin":f"https://127.0.0.1:{port}"}):
   try:
    opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode(fields).encode(),headers=headers,method="POST"),timeout=2)
    raise AssertionError(f"invalid origin was accepted: {headers}")
   except urllib.error.HTTPError as error:
    assert error.code==403 and json.loads(error.read().decode())["code"]=="origin_rejected"
  oversized={**fields,"message":"x"*17000}
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode(oversized).encode(),headers={"Origin":base},method="POST"),timeout=2)
   raise AssertionError("oversized request body was accepted")
  except urllib.error.HTTPError as error:
   assert error.code==413 and json.loads(error.read().decode())["code"]=="payload_too_large"
  array_fields={**fields}
  array_fields["name[]"]="Injected array"
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode(array_fields).encode(),headers={"Origin":base},method="POST"),timeout=2)
   raise AssertionError("array-shaped form field unexpectedly succeeded")
  except urllib.error.HTTPError as error:
   assert error.code==422 and json.loads(error.read().decode())["code"]=="validation_failed"
  try:
   opener.open(urllib.request.Request(base+"/contact.php",data=urllib.parse.urlencode(fields).encode(),headers={"Origin":base},method="POST"),timeout=2)
   raise AssertionError("unconfigured contact form claimed success")
  except urllib.error.HTTPError as error:
   data=json.loads(error.read().decode())
   assert error.code==503 and data["ok"] is False and data["code"]=="not_configured"
   assert "not been sent" in data["message"]
  try:
   opener.open(base+"/contact.php",timeout=2); raise AssertionError("unsupported GET unexpectedly succeeded")
  except urllib.error.HTTPError as error: assert error.code==405
  print("Contact endpoint smoke tests passed: strict session cookies, fixation rejection, origin checks, request-size limits, CSRF and safe mail fallback.")
 finally:
  server.terminate()
  try: server.wait(timeout=5)
  except subprocess.TimeoutExpired: server.kill(); server.wait(timeout=5)
if __name__=="__main__": main()
