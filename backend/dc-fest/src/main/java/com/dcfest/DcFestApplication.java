package com.dcfest;

import io.github.cdimascio.dotenv.Dotenv;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

@EnableScheduling
@SpringBootApplication
public class DcFestApplication {

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

	public static void main(String[] args) {
//        Dotenv dotenv = Dotenv.configure().directory("./").load();

        // Log the values to confirm they are loaded
//        System.out.println("Environment variables loaded:");
//        dotenv.entries().forEach(entry -> System.out.println(entry.getKey() + "=" + entry.getValue()));

		SpringApplication.run(DcFestApplication.class, args);
	}

}
