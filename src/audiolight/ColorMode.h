#ifndef COLOR_MODE_H
#define COLOR_MODE_H

#include <Arduino.h>
#include <audiolight/AudioLightMode.h>
#include <audiolight/JsonUtil.h>

// DEFAULT VALUES
#define COLOR_DEFAULT_COLOR CRGB::White
#define COLOR_DEFAULT_BRIGHTNESS 128
#define COLOR_DEFAULT_AUDIO_ENABLED false

class ColorMode : public AudioLightMode {

  private:
    CRGB _color = COLOR_DEFAULT_COLOR;
    bool _audioEnabled = COLOR_DEFAULT_AUDIO_ENABLED;
    uint8_t _brightness = COLOR_DEFAULT_BRIGHTNESS;
    bool *_includedBands;
    boolean _refresh = true;

  public:
    ColorMode(CLEDController *ledController, CRGB *leds, uint16_t numLeds, uint16_t *bands, uint16_t numBands) 
    : AudioLightMode(ledController, leds, numLeds, bands, numBands) {
      // TODO - Util for this, duplicated!
      _includedBands = (bool *) malloc(sizeof(bool) * numBands);
      for (int i=0; i<numBands / 2; i++) {
        _includedBands[i] = true;
      }
    };
    String getId();
    void tick();
    void sampleComplete() {};
    void enable();
    void updateConfig(JsonObject& root);
    void writeConfig(JsonObject& root);
};

#endif