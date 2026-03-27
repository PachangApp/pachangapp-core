package com.pachangapp.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class WeatherService {

    @Value("${pachangapp.app.weatherApiKey:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> getWeatherForecast(String city) {
        if (apiKey == null || apiKey.isEmpty()) {
            return Map.of("error", "API Key de clima no configurada");
        }
        
        String url = String.format("https://api.openweathermap.org/data/2.5/weather?q=%s&appid=%s&units=metric&lang=es", city, apiKey);
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of("error", "No se pudo obtener el clima: " + e.getMessage());
        }
    }
}
