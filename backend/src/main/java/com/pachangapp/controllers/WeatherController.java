package com.pachangapp.controllers;

import com.pachangapp.services.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    @GetMapping
    public Map<String, Object> getWeather(@RequestParam String city) {
        return weatherService.getWeatherForecast(city);
    }
}
