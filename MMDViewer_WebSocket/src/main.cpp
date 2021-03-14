#define LGFX_AUTODETECT // 自動認識

#include <M5Core2.h>
#include <LovyanGFX.hpp>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebSocketsServer.h>

const char* wifi_ssid = "【WiFiアクセスポイントのSSID】";
const char* wifi_password = "【WiFiアクセスポイントのパスワード】";

#define WEBSOCKET_PORT  81 // WebSocketのポート番号

WebSocketsServer webSocket = WebSocketsServer(WEBSOCKET_PORT);
static LGFX lcd; 

void wifi_connect(const char *ssid, const char *password){
  Serial.println("");
  Serial.print("WiFi Connenting");
  lcd.println("WiFi Connecting");
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    lcd.print(".");
    delay(1000);
  }
  Serial.println("");
  Serial.print("Connected : ");
  Serial.print(WiFi.localIP());
  Serial.print(" (");
  Serial.print(WEBSOCKET_PORT);
  Serial.println(")");
  lcd.println("");
  lcd.print("Connected : ");
  lcd.print(WiFi.localIP());
  lcd.print(" (");
  lcd.print(WEBSOCKET_PORT);
  lcd.println(")");
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:{
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d url: %s\n", num, ip[0], ip[1], ip[2], ip[3], payload);
      }
      break;
    case WStype_BIN:
//      Serial.printf("WStype_BIN : [%u] get binary length: %u\n", num, length);
      lcd.drawJpg(payload, length);
      break;
    case WStype_ERROR:
      Serial.printf("WStype_ERROR : [%u]", num);
      break;
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    case WStype_FRAGMENT_TEXT_START:
    default:
      break;
  }
}

void setup() {
  Serial.begin(9600);
  Serial.println("setup");

  lcd.init();

  wifi_connect(wifi_ssid, wifi_password);

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
}
